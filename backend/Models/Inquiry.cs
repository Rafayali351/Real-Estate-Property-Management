using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Api.Models;

[Table("Inquiries")]
public class Inquiry
{
    [Key]
    public int InquiryId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Phone { get; set; }

    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public int? PropertyId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "New"; // "New" | "Read" | "Replied"

    public string? ReplyMessage { get; set; }

    public DateTime? RepliedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(PropertyId))]
    public virtual Property? Property { get; set; }
}
