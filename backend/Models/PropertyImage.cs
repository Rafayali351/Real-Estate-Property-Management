using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Api.Models;

[Table("PropertyImages")]
public class PropertyImage
{
    [Key]
    public int ImageId { get; set; }

    [Required]
    public int PropertyId { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(PropertyId))]
    public virtual Property? Property { get; set; }
}
