using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Api.Models;

[Table("TourBookings")]
public class TourBooking
{
    [Key]
    public int BookingId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int PropertyId { get; set; }

    [Required]
    [MaxLength(150)]
    public string ClientName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string ClientEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ClientPhone { get; set; } = string.Empty;

    public DateTime PreferredDate { get; set; }

    public string? Notes { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // "Pending" | "Confirmed" | "Completed" | "Cancelled"

    [MaxLength(1000)]
    public string? AdminNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(PropertyId))]
    public virtual Property? Property { get; set; }
}
