using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Api.Models;

[Table("SiteSettings")]
public class SiteSetting
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int SettingsId { get; set; } = 1;

    [Required]
    [MaxLength(150)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Tagline { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string ContactEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ContactPhone { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string WhatsAppNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? FacebookUrl { get; set; }

    [MaxLength(300)]
    public string? InstagramUrl { get; set; }

    [MaxLength(300)]
    public string? LinkedInUrl { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
