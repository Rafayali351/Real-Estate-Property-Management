using System.ComponentModel.DataAnnotations;

namespace RealEstate.Api.DTOs.Auth;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Full Name must be between 2 and 150 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone number is required.")]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
    public string Password { get; set; } = string.Empty;

    public string? ConfirmPassword { get; set; }

    public bool AgreeToTerms { get; set; } = true;
}

public class LoginRequestDto
{
    [Required(ErrorMessage = "Email or phone number is required.")]
    public string Identifier { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = string.Empty;
}

public class AuthChallengeResponseDto
{
    public string ChallengeToken { get; set; } = string.Empty;
    public string MaskedEmail { get; set; } = string.Empty;
    public string MaskedPhone { get; set; } = string.Empty;
}

public class SendOtpRequestDto
{
    [Required(ErrorMessage = "Challenge token is required.")]
    public string ChallengeToken { get; set; } = string.Empty;

    [Required(ErrorMessage = "Verification channel is required.")]
    [RegularExpression("^(?i)(Email|Sms)$", ErrorMessage = "Channel must be 'Email' or 'Sms'.")]
    public string Channel { get; set; } = string.Empty;
}

public class VerifyOtpRequestDto
{
    [Required(ErrorMessage = "Challenge token is required.")]
    public string ChallengeToken { get; set; } = string.Empty;

    [Required(ErrorMessage = "Verification code is required.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be exactly 6 digits.")]
    public string Code { get; set; } = string.Empty;
}

public class ForgotPasswordRequestDto
{
    [Required(ErrorMessage = "Email or phone number is required.")]
    public string Identifier { get; set; } = string.Empty;
}

public class ResetPasswordRequestDto
{
    [Required(ErrorMessage = "Identifier is required.")]
    public string Identifier { get; set; } = string.Empty;

    [Required(ErrorMessage = "Verification code is required.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be 6 digits.")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
        ErrorMessage = "Password must include uppercase, lowercase, a digit, and a special symbol.")]
    public string NewPassword { get; set; } = string.Empty;
}

public class CurrentUserDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsEmailVerified { get; set; }
    public bool IsPhoneVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}
