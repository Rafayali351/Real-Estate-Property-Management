using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Api.Models;

[Table("Favorites")]
public class Favorite
{
    public int UserId { get; set; }

    public int PropertyId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(PropertyId))]
    public virtual Property? Property { get; set; }
}
