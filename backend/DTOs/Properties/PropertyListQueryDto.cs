namespace RealEstate.Api.DTOs.Properties;

public class PropertyListQueryDto
{
    public string? Search { get; set; }
    public string? City { get; set; }
    public string? PropertyType { get; set; }
    public string? ListingType { get; set; } // "Sale" | "Rent"
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? Bedrooms { get; set; }
    public bool? IsFeatured { get; set; }
    public string? Status { get; set; } // Optional: "Available", etc.
    public string? SortBy { get; set; } // "newest" | "price_asc" | "price_desc"
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 9;
}
