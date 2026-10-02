using System.ComponentModel.DataAnnotations;

namespace RealEstate.Api.Settings;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    [Required(ErrorMessage = "Jwt:Secret is required.")]
    [MinLength(32, ErrorMessage = "Jwt:Secret must be at least 32 characters long.")]
    public string Secret { get; set; } = string.Empty;

    [Required(ErrorMessage = "Jwt:Issuer is required.")]
    public string Issuer { get; set; } = string.Empty;

    [Required(ErrorMessage = "Jwt:Audience is required.")]
    public string Audience { get; set; } = string.Empty;

    [Range(1, 90, ErrorMessage = "Jwt:ExpiryDays must be between 1 and 90.")]
    public int ExpiryDays { get; set; } = 7;
}
