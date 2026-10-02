using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Api.Models;

[Table("OtpCodes")]
public class OtpCode
{
    [Key]
    public int OtpId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(128)]
    public string CodeHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Channel { get; set; } = string.Empty; // "Email" | "Sms"

    [Required]
    [MaxLength(20)]
    public string Purpose { get; set; } = string.Empty; // "Signup" | "Login" | "PasswordReset" | "ChangeContact"

    [Required]
    [MaxLength(150)]
    public string Destination { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public int AttemptCount { get; set; } = 0;

    public bool IsUsed { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}
