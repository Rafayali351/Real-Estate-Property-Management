using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Common;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Account;
using RealEstate.Api.DTOs.Auth;
using RealEstate.Api.Models;
using RealEstate.Api.Services;

namespace RealEstate.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IOtpService _otpService;

    public AccountController(ApplicationDbContext db, IOtpService otpService)
    {
        _db = db;
        _otpService = otpService;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var id))
        {
            return id;
        }
        throw new UnauthorizedAccessException("User identification claim is missing or invalid.");
    }

    /// <summary>
    /// Update the authenticated user's full name.
    /// </summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
        {
            return NotFound(new ProblemDetails
            {
                Title = "User Not Found",
                Status = StatusCodes.Status404NotFound
            });
        }

        user.FullName = dto.FullName.Trim();
        await _db.SaveChangesAsync();

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

    /// <summary>
    /// Change password after verifying the existing current password.
    /// </summary>
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
        {
            return NotFound(new ProblemDetails
            {
                Title = "User Not Found",
                Status = StatusCodes.Status404NotFound
            });
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Incorrect Password",
                Detail = "The current password provided is incorrect.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword, 12);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully." });
    }

    /// <summary>
    /// Request to change email or phone number. Sends an OTP to the NEW destination.
    /// </summary>
    [HttpPost("change-contact/request")]
    public async Task<IActionResult> RequestContactChange([FromBody] ChangeContactRequestDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
        {
            return NotFound();
        }

        var isEmail = dto.Type.Equals("Email", StringComparison.OrdinalIgnoreCase);
        string normalizedNewValue;

        if (isEmail)
        {
            normalizedNewValue = dto.NewValue.Trim().ToLowerInvariant();
            if (!normalizedNewValue.Contains('@') || normalizedNewValue.Length > 150)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Email",
                    Detail = "Please provide a valid email address.",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            var emailTaken = await _db.Users
                .AnyAsync(u => u.Email == normalizedNewValue && u.UserId != userId && u.IsEmailVerified);

            if (emailTaken)
            {
                return Conflict(new ProblemDetails
                {
                    Title = "Email In Use",
                    Detail = "This email address is already verified on another account.",
                    Status = StatusCodes.Status409Conflict
                });
            }
        }
        else
        {
            if (!PhoneNumberNormalizer.TryNormalize(dto.NewValue, out normalizedNewValue))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Phone Number",
                    Detail = "Please provide a valid phone number in E.164 or local format.",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            var phoneTaken = await _db.Users
                .AnyAsync(u => u.Phone == normalizedNewValue && u.UserId != userId && u.IsPhoneVerified);

            if (phoneTaken)
            {
                return Conflict(new ProblemDetails
                {
                    Title = "Phone Number In Use",
                    Detail = "This phone number is already verified on another account.",
                    Status = StatusCodes.Status409Conflict
                });
            }
        }

        var channel = isEmail ? "Email" : "Sms";
        var result = await _otpService.GenerateAndSendOtpAsync(user, "ChangeContact", channel, normalizedNewValue);

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
                Title = "Delivery Failed",
                Detail = result.ErrorMessage ?? "Could not send verification code to new destination.",
                Status = StatusCodes.Status503ServiceUnavailable
            });
        }

        return Ok(new
        {
            message = $"Verification code dispatched to {dto.Type.ToLowerInvariant()}.",
            destination = isEmail ? StringMasker.MaskEmail(normalizedNewValue) : StringMasker.MaskPhone(normalizedNewValue)
        });
    }

    /// <summary>
    /// Confirm contact change by verifying code sent to the new destination.
    /// </summary>
    [HttpPost("change-contact/confirm")]
    public async Task<IActionResult> ConfirmContactChange([FromBody] ConfirmContactChangeDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
        {
            return NotFound();
        }

        var verifyResult = await _otpService.VerifyOtpAsync(userId, "ChangeContact", dto.Code);
        if (!verifyResult.Success)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Verification Failed",
                Detail = verifyResult.ErrorMessage,
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Retrieve the latest verified OTP for ChangeContact to obtain the destination
        var latestOtp = await _db.OtpCodes
            .Where(o => o.UserId == userId && o.Purpose == "ChangeContact" && o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (latestOtp == null)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Change Record Missing",
                Detail = "Could not locate verified contact change payload.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (latestOtp.Channel == "Email")
        {
            user.Email = latestOtp.Destination;
            user.IsEmailVerified = true;
        }
        else if (latestOtp.Channel == "Sms")
        {
            user.Phone = latestOtp.Destination;
            user.IsPhoneVerified = true;
        }

        await _db.SaveChangesAsync();

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
