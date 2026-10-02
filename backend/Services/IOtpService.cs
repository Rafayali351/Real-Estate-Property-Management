using RealEstate.Api.Models;

namespace RealEstate.Api.Services;

public record OtpSendResult(bool Success, string? ErrorMessage = null, int? RetryAfterSeconds = null, string? DevCode = null);
public record OtpVerifyResult(bool Success, string? ErrorMessage = null, int RemainingAttempts = 0);

public interface IOtpService
{
    Task<OtpSendResult> GenerateAndSendOtpAsync(User user, string purpose, string channel, string destination);
    Task<OtpVerifyResult> VerifyOtpAsync(int userId, string purpose, string code);
}
