using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Api.Models;

[Table("Properties")]
public class Property
{
    [Key]
    public int PropertyId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Required]
    [MaxLength(20)]
    public string ListingType { get; set; } = "Sale"; // "Sale" | "Rent"

    [Required]
    [MaxLength(255)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string PropertyType { get; set; } = string.Empty; // "Mansion" | "Penthouse" | "Villa" | "Apartment"

    public int Bedrooms { get; set; }

    public int Bathrooms { get; set; }

    public int SqFt { get; set; }

    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    public bool IsFeatured { get; set; } = false;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Available"; // "Available" | "Reserved" | "Sold" | "Rented"

    public int? AgentId { get; set; }

    public bool IsActive { get; set; } = true; // Soft delete

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(AgentId))]
    public virtual Agent? Agent { get; set; }

    public virtual ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public virtual ICollection<TourBooking> TourBookings { get; set; } = new List<TourBooking>();
    public virtual ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
}
