namespace RealEstate.Api.DTOs.Tours;

public class TourBookingDto
{
    public int BookingId { get; set; }
    public int PropertyId { get; set; }
    public string PropertyTitle { get; set; } = string.Empty;
    public string PropertyAddress { get; set; } = string.Empty;
    public string PropertyCity { get; set; } = string.Empty;
    public string PropertyImageUrl { get; set; } = string.Empty;
    public decimal PropertyPrice { get; set; }
    public string PropertyListingType { get; set; } = "Sale";

    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public DateTime PreferredDate { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Pending";
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
}
