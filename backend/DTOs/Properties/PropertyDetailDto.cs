using RealEstate.Api.DTOs.Agents;

namespace RealEstate.Api.DTOs.Properties;

public class PropertyDetailDto
{
    public int PropertyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ListingType { get; set; } = "Sale";
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public int SqFt { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public string Status { get; set; } = "Available";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public AgentDto? Agent { get; set; }
    public List<PropertyImageDto> Images { get; set; } = new();
    public List<PropertySummaryDto> SimilarProperties { get; set; } = new();
    public bool IsFavorited { get; set; }
}
