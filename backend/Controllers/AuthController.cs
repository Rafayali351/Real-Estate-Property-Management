using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RealEstate.Api.Common;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Auth;
using RealEstate.Api.Models;
using RealEstate.Api.Services;
using RealEstate.Api.Settings;
using Serilog;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IOtpService _otpService;
    private readonly JwtSettings _jwtSettings;
    private readonly IWebHostEnvironment _env;

    public AuthController(
        ApplicationDbContext db,
        ITokenService tokenService,
        IOtpService otpService,
        IOptions<JwtSettings> jwtSettings,
        IWebHostEnvironment env)
    {
        _db = db;
        _tokenService = tokenService;
        _otpService = otpService;
        _jwtSettings = jwtSettings.Value;
        _env = env;
    }

    /// <summary>
    /// Register a new client account. Returns a short-lived challenge token for OTP verification.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        if (!PhoneNumberNormalizer.TryNormalize(dto.Phone, out var normalizedPhone))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Phone Number",
                Detail = "The provided phone number is not valid. Please specify standard local or E.164 international format.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Check if an existing account matches email or phone
        var existingUser = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail || u.Phone == normalizedPhone);

        User user;
        if (existingUser != null)
        {
            // If the account has already been verified, conflict!
            if (existingUser.IsEmailVerified || existingUser.IsPhoneVerified)
            {
                return Conflict(new ProblemDetails
                {
                    Title = "Account Already Exists",
                    Detail = "An account associated with this email or phone number is already verified. Please sign in instead.",
                    Status = StatusCodes.Status409Conflict
                });
            }

            // Unverified account: allow updating information and continuing verification
            existingUser.FullName = dto.FullName.Trim();
            existingUser.Email = normalizedEmail;
            existingUser.Phone = normalizedPhone;
            existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12);
            existingUser.FailedLoginCount = 0;
            existingUser.LockoutUntil = null;
            user = existingUser;
        }
        else
        {
            user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = normalizedEmail,
                Phone = normalizedPhone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
                Role = "Client",
                IsEmailVerified = false,
                IsPhoneVerified = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _db.Users.Add(user);
        }

        await _db.SaveChangesAsync();

        var challengeToken = _tokenService.GenerateChallengeToken(user.UserId, "Signup");

        return Ok(new AuthChallengeResponseDto
        {
            ChallengeToken = challengeToken,
            MaskedEmail = StringMasker.MaskEmail(user.Email),
            MaskedPhone = StringMasker.MaskPhone(user.Phone)
        });
    }

    /// <summary>
    /// Authenticate credentials. Returns a challenge token for OTP verification.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var identifier = dto.Identifier.Trim();
        var isEmail = identifier.Contains('@');

        string normalizedIdentifier;
        if (isEmail)
        {
            normalizedIdentifier = identifier.ToLowerInvariant();
        }
        else
        {
            if (!PhoneNumberNormalizer.TryNormalize(identifier, out normalizedIdentifier))
            {
                normalizedIdentifier = identifier;
            }
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedIdentifier || u.Phone == normalizedIdentifier);

        if (user == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication Failed",
                Detail = "Invalid credentials.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        if (!user.IsActive)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Title = "Account Disabled",
                Detail = "This account has been disabled. Please contact support.",
                Status = StatusCodes.Status403Forbidden
            });
        }

        // Check Account Lockout
        if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
        {
            var remainingMinutes = (int)Math.Ceiling((user.LockoutUntil.Value - DateTime.UtcNow).TotalMinutes);
            return StatusCode(StatusCodes.Status423Locked, new ProblemDetails
            {
                Title = "Account Locked",
                Detail = $"Too many failed attempts. Account is locked. Please try again in {remainingMinutes} minute(s).",
                Status = StatusCodes.Status423Locked
            });
        }

        // Verify Password Hash
        var isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            user.FailedLoginCount++;
            if (user.FailedLoginCount >= 5)
            {
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(15);
                user.FailedLoginCount = 0;
                await _db.SaveChangesAsync();

                return StatusCode(StatusCodes.Status423Locked, new ProblemDetails
                {
                    Title = "Account Locked",
                    Detail = "Account locked for 15 minutes due to 5 consecutive failed attempts.",
                    Status = StatusCodes.Status423Locked
                });
            }

            await _db.SaveChangesAsync();
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication Failed",
                Detail = "Invalid credentials.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        // Successful password verification: reset lockout counters
        user.FailedLoginCount = 0;
        user.LockoutUntil = null;
        await _db.SaveChangesAsync();

        var challengeToken = _tokenService.GenerateChallengeToken(user.UserId, "Login");

        return Ok(new AuthChallengeResponseDto
        {
            ChallengeToken = challengeToken,
            MaskedEmail = StringMasker.MaskEmail(user.Email),
            MaskedPhone = StringMasker.MaskPhone(user.Phone)
        });
    }

    /// <summary>
    /// Dispatch an OTP code via Email or SMS.
    /// </summary>
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequestDto dto)
    {
        if (!_tokenService.ValidateChallengeToken(dto.ChallengeToken, out var userId, out var purpose))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Challenge Session",
                Detail = "Your verification challenge has expired or is invalid. Please restart login or signup.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
        {
            return NotFound(new ProblemDetails
            {
                Title = "User Not Found",
                Detail = "The specified user account could not be located.",
                Status = StatusCodes.Status404NotFound
            });
        }

        var channel = dto.Channel.Equals("Sms", StringComparison.OrdinalIgnoreCase) ? "Sms" : "Email";
        var destination = channel == "Email" ? user.Email : user.Phone;

        var result = await _otpService.GenerateAndSendOtpAsync(user, purpose, channel, destination);

        if (!result.Success)
        {
            if (result.RetryAfterSeconds.HasValue)
            {
                Response.Headers.Append("Retry-After", result.RetryAfterSeconds.Value.ToString());
                return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
                {
                    Title = "Rate Limit Exceeded",
                    Detail = result.ErrorMessage,
                    Status = StatusCodes.Status429TooManyRequests
                });
            }

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new ProblemDetails
            {
                Title = "Delivery Provider Error",
                Detail = result.ErrorMessage ?? "We couldn't send the code, try the other option.",
                Status = StatusCodes.Status503ServiceUnavailable
            });
        }

        return Ok(new
        {
            message = $"Verification code successfully dispatched to your {channel}.",
            destination = channel == "Email" ? StringMasker.MaskEmail(destination) : StringMasker.MaskPhone(destination)
        });
    }

    /// <summary>
    /// Verify the 6-digit OTP code and establish the authenticated session via HttpOnly cookie.
    /// </summary>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto dto)
    {
        if (!_tokenService.ValidateChallengeToken(dto.ChallengeToken, out var userId, out var purpose))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Challenge Session",
                Detail = "Your verification session has expired. Please restart the process.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Account Inactive",
                Detail = "Account cannot be authenticated.",
                Status = StatusCodes.Status404NotFound
            });
        }

        var verifyResult = await _otpService.VerifyOtpAsync(userId, purpose, dto.Code);
        if (!verifyResult.Success)
        {
            return BadRequest(new
            {
                title = "Verification Failed",
                message = verifyResult.ErrorMessage,
                remainingAttempts = verifyResult.RemainingAttempts
            });
        }

        // Mark verified flags
        var latestOtp = await _db.OtpCodes
            .Where(o => o.UserId == userId && o.Purpose == purpose && o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestOtp != null && latestOtp.Channel == "Email")
        {
            user.IsEmailVerified = true;
        }
        else if (latestOtp != null && latestOtp.Channel == "Sms")
        {
            user.IsPhoneVerified = true;
        }

        user.LastLoginAt = DateTime.UtcNow;
        user.FailedLoginCount = 0;
        user.LockoutUntil = null;
        await _db.SaveChangesAsync();

        // Issue 7-Day Session JWT into HttpOnly Cookie
        var sessionToken = _tokenService.GenerateSessionToken(user);

        var isDevelopment = _env.IsDevelopment();
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(_jwtSettings.ExpiryDays),
            Path = "/"
        };

        Response.Cookies.Append("re_auth", sessionToken, cookieOptions);

        return Ok(new
        {
            message = "Authentication successful.",
            user = new CurrentUserDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                IsEmailVerified = user.IsEmailVerified,
                IsPhoneVerified = user.IsPhoneVerified,
                CreatedAt = user.CreatedAt
            },
            redirectUrl = user.Role == "Admin" ? "/admin" : "/"
        });
    }

    /// <summary>
    /// Initiate a password reset flow. Sends generic response to avoid user enumeration.
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
    {
        var rawIdentifier = dto.Identifier.Trim();
        var isEmail = rawIdentifier.Contains('@');

        string normalized;
        if (isEmail)
        {
            normalized = rawIdentifier.ToLowerInvariant();
        }
        else
        {
            PhoneNumberNormalizer.TryNormalize(rawIdentifier, out normalized);
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == normalized || u.Phone == normalized);

        if (user != null && user.IsActive)
        {
            var channel = isEmail ? "Email" : "Sms";
            var destination = isEmail ? user.Email : user.Phone;

            // Generate and dispatch OTP
            _ = Task.Run(async () =>
            {
                try
                {
                    await _otpService.GenerateAndSendOtpAsync(user, "PasswordReset", channel, destination);
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "Background password reset dispatch failed for UserId {UserId}", user.UserId);
                }
            });
        }

        // Generic response
        return Ok(new
        {
            message = "If an account associated with this information exists, a 6-digit verification code has been dispatched."
        });
    }

    /// <summary>
    /// Reset password using the 6-digit code.
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
    {
        var rawIdentifier = dto.Identifier.Trim();
        var isEmail = rawIdentifier.Contains('@');

        string normalized;
        if (isEmail)
        {
            normalized = rawIdentifier.ToLowerInvariant();
        }
        else
        {
            PhoneNumberNormalizer.TryNormalize(rawIdentifier, out normalized);
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == normalized || u.Phone == normalized);

        if (user == null || !user.IsActive)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Reset Failed",
                Detail = "Invalid password reset request.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var verifyResult = await _otpService.VerifyOtpAsync(user.UserId, "PasswordReset", dto.Code);
        if (!verifyResult.Success)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Verification Failed",
                Detail = verifyResult.ErrorMessage,
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Update password with BCrypt
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword, 12);
        user.FailedLoginCount = 0;
        user.LockoutUntil = null;

        // Invalidate all remaining OTPs for this user
        var unusedCodes = await _db.OtpCodes
            .Where(o => o.UserId == user.UserId && !o.IsUsed)
            .ToListAsync();

        foreach (var c in unusedCodes)
        {
            c.IsUsed = true;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Password has been successfully reset. You may now log in with your new credentials."
        });
    }

    /// <summary>
    /// Log out the currently authenticated user by clearing the re_auth cookie.
    /// </summary>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("re_auth", new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        return Ok(new { message = "Logged out successfully." });
    }

    /// <summary>
    /// Returns the currently authenticated user's profile and roles.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null || !user.IsActive)
        {
            return Unauthorized();
        }

        return Ok(new CurrentUserDto
        {
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role,
            IsEmailVerified = user.IsEmailVerified,
            IsPhoneVerified = user.IsPhoneVerified,
            CreatedAt = user.CreatedAt
        });
    }
}
