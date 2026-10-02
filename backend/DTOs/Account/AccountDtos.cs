using System.ComponentModel.DataAnnotations;

namespace RealEstate.Api.DTOs.Account;

public class UpdateProfileRequestDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Full Name must be between 2 and 150 characters.")]
    public string FullName { get; set; } = string.Empty;
}

public class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "Current password is required.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "New password must be at least 8 characters long.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
        ErrorMessage = "Password must include uppercase, lowercase, a digit, and a special symbol.")]
    public string NewPassword { get; set; } = string.Empty;
}

public class ChangeContactRequestDto
{
    [Required(ErrorMessage = "Contact type is required ('Email' or 'Phone').")]
    [RegularExpression("^(?i)(Email|Phone)$", ErrorMessage = "Type must be 'Email' or 'Phone'.")]
    public string Type { get; set; } = string.Empty;

    [Required(ErrorMessage = "New value is required.")]
    public string NewValue { get; set; } = string.Empty;
}

public class ConfirmContactChangeDto
{
    [Required(ErrorMessage = "Verification code is required.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be 6 digits.")]
    public string Code { get; set; } = string.Empty;
}
