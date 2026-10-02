using System.ComponentModel.DataAnnotations;

namespace RealEstate.Api.Settings;

public class OtpSettings
{
    public const string SectionName = "Otp";

    [Required(ErrorMessage = "Otp:HashSecret is required.")]
    [MinLength(16, ErrorMessage = "Otp:HashSecret must be at least 16 characters long.")]
    public string HashSecret { get; set; } = string.Empty;

    public int ExpiryMinutes { get; set; } = 5;
    public int MaxAttempts { get; set; } = 5;
    public int ResendCooldownSeconds { get; set; } = 60;
    public int MaxCodesPerHour { get; set; } = 5;
}
