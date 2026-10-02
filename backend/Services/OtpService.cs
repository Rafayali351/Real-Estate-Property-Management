using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RealEstate.Api.Data;
using RealEstate.Api.Models;
using RealEstate.Api.Settings;
using Serilog;

namespace RealEstate.Api.Services;

public class OtpService : IOtpService
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly ISmsSender _smsSender;
    private readonly OtpSettings _otpSettings;
    private readonly IWebHostEnvironment _env;
    private readonly byte[] _secretKey;

    public OtpService(
        ApplicationDbContext db,
        IEmailSender emailSender,
        ISmsSender smsSender,
        IOptions<OtpSettings> otpSettings,
        IWebHostEnvironment env)
    {
        _db = db;
        _emailSender = emailSender;
        _smsSender = smsSender;
        _otpSettings = otpSettings.Value;
        _env = env;
        _secretKey = Encoding.UTF8.GetBytes(_otpSettings.HashSecret);
    }

    public async Task<OtpSendResult> GenerateAndSendOtpAsync(User user, string purpose, string channel, string destination)
    {
        var now = DateTime.UtcNow;

        // 1. Check Hourly Limit (Max 5 codes per hour)
        var oneHourAgo = now.AddHours(-1);
        var recentCodesCount = await _db.OtpCodes
            .Where(o => o.UserId == user.UserId && o.CreatedAt >= oneHourAgo)
            .CountAsync();

        if (recentCodesCount >= _otpSettings.MaxCodesPerHour)
        {
            // Calculate earliest code from the window to determine retry cooldown
            var earliestCode = await _db.OtpCodes
                .Where(o => o.UserId == user.UserId && o.CreatedAt >= oneHourAgo)
                .OrderBy(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            var retryAfter = earliestCode != null 
                ? (int)Math.Max(1, 3600 - (now - earliestCode.CreatedAt).TotalSeconds) 
                : 3600;

            Log.Warning("Rate limit reached for UserId {UserId}: {Count} codes generated in last hour.", user.UserId, recentCodesCount);
            return new OtpSendResult(false, $"Maximum hourly verification attempts reached. Please retry in {retryAfter / 60} minute(s).", retryAfter);
        }

        // 2. Check Resend Cooldown (60 seconds)
        var latestCode = await _db.OtpCodes
            .Where(o => o.UserId == user.UserId && o.Purpose == purpose)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestCode != null)
        {
            var elapsedSeconds = (now - latestCode.CreatedAt).TotalSeconds;
            if (elapsedSeconds < _otpSettings.ResendCooldownSeconds)
            {
                var remaining = (int)Math.Ceiling(_otpSettings.ResendCooldownSeconds - elapsedSeconds);
                return new OtpSendResult(false, $"Please wait {remaining} seconds before requesting a new code.", remaining);
            }
        }

        // 3. Cryptographically Secure 6-Digit Code Generation
        var rawCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
        var codeHash = ComputeHash(rawCode);

        // 4. Invalidate Previous Unused Codes for This User & Purpose
        var previousUnusedCodes = await _db.OtpCodes
            .Where(o => o.UserId == user.UserId && o.Purpose == purpose && !o.IsUsed)
            .ToListAsync();

        foreach (var oldCode in previousUnusedCodes)
        {
            oldCode.IsUsed = true;
        }

        // 5. Store New OTP in Database
        var otpEntry = new OtpCode
        {
            UserId = user.UserId,
            CodeHash = codeHash,
            Channel = channel,
            Purpose = purpose,
            Destination = destination,
            ExpiresAt = now.AddMinutes(_otpSettings.ExpiryMinutes),
            AttemptCount = 0,
            IsUsed = false,
            CreatedAt = now
        };

        _db.OtpCodes.Add(otpEntry);
        await _db.SaveChangesAsync();

        // 6. Deliver via Real Provider (NEVER log the OTP code)
        try
        {
            if (channel.Equals("Email", StringComparison.OrdinalIgnoreCase))
            {
                await _emailSender.SendOtpEmailAsync(destination, rawCode);
            }
            else if (channel.Equals("Sms", StringComparison.OrdinalIgnoreCase))
            {
                await _smsSender.SendOtpSmsAsync(destination, rawCode);
            }
            else
            {
                return new OtpSendResult(false, $"Unsupported notification channel: {channel}");
            }

            Log.Information("OTP dispatched successfully for UserId {UserId} via channel {Channel}", user.UserId, channel);
            return new OtpSendResult(true, DevCode: _env.IsDevelopment() ? rawCode : null);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to deliver OTP to recipient via channel {Channel}", channel);
            try
            {
                _db.OtpCodes.Remove(otpEntry);
                await _db.SaveChangesAsync();
            }
            catch
            {
                // ignore rollback failure
            }

            return new OtpSendResult(false, $"We couldn't deliver the code via {channel}. Please choose the other verification option or check service settings.");
        }
    }

    public async Task<OtpVerifyResult> VerifyOtpAsync(int userId, string purpose, string code)
    {
        if (string.IsNullOrWhiteSpace(code) || code.Length != 6)
        {
            return new OtpVerifyResult(false, "Verification code must be 6 digits.");
        }

        var now = DateTime.UtcNow;

        // Retrieve latest unused code for this user and purpose
        var otp = await _db.OtpCodes
            .Where(o => o.UserId == userId && o.Purpose == purpose && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp == null)
        {
            return new OtpVerifyResult(false, "No active verification code found. Please request a new code.");
        }

        // Check Expiration (5 minutes)
        if (now > otp.ExpiresAt)
        {
            otp.IsUsed = true;
            await _db.SaveChangesAsync();
            return new OtpVerifyResult(false, "Verification code has expired. Please request a new one.");
        }

        // Check if Max Attempts Reached
        if (otp.AttemptCount >= _otpSettings.MaxAttempts)
        {
            otp.IsUsed = true;
            await _db.SaveChangesAsync();
            return new OtpVerifyResult(false, "Maximum attempts reached. This code is no longer valid. Please request a new code.");
        }

        // Verify Hash using FixedTimeEquals to prevent timing attacks
        var computedHash = ComputeHash(code);
        var computedHashBytes = Convert.FromHexString(computedHash);
        var storedHashBytes = Convert.FromHexString(otp.CodeHash);

        var isMatch = CryptographicOperations.FixedTimeEquals(computedHashBytes, storedHashBytes);

        if (!isMatch)
        {
            otp.AttemptCount++;
            var remaining = _otpSettings.MaxAttempts - otp.AttemptCount;
            if (remaining <= 0)
            {
                otp.IsUsed = true;
            }

            await _db.SaveChangesAsync();

            return remaining > 0
                ? new OtpVerifyResult(false, $"Invalid verification code. {remaining} attempt(s) remaining.", remaining)
                : new OtpVerifyResult(false, "Invalid code. Maximum attempts exceeded. Please request a new code.", 0);
        }

        // Correct Code Verified!
        otp.IsUsed = true;
        await _db.SaveChangesAsync();

        Log.Information("OTP successfully verified for UserId {UserId}, Purpose: {Purpose}", userId, purpose);
        return new OtpVerifyResult(true);
    }

    private string ComputeHash(string input)
    {
        using var hmac = new HMACSHA256(_secretKey);
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(input.Trim()));
        return Convert.ToHexString(hashBytes);
    }
}
