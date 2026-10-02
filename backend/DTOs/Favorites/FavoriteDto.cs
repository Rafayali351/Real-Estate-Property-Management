namespace RealEstate.Api.DTOs.Favorites;

public class FavoriteDto
{
    public int PropertyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ListingType { get; set; } = "Sale";
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public int SqFt { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Available";
    public DateTime CreatedAt { get; set; }
}
