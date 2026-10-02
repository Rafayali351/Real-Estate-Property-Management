using System.ComponentModel.DataAnnotations;

namespace RealEstate.Api.DTOs.Admin;

public class AdminPropertyCreateUpdateDto
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Range(0, 999999999999)]
    public decimal Price { get; set; }

    [Required]
    [MaxLength(20)]
    public string ListingType { get; set; } = "Sale";

    [Required]
    [MaxLength(255)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string PropertyType { get; set; } = string.Empty;

    [Range(0, 50)]
    public int Bedrooms { get; set; }

    [Range(0, 50)]
    public int Bathrooms { get; set; }

    [Range(0, 1000000)]
    public int SqFt { get; set; }

    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    public bool IsFeatured { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Available"; // "Available" | "Reserved" | "Sold" | "Rented"

    public int? AgentId { get; set; }

    public List<string>? GalleryImageUrls { get; set; }
}

public class AdminImageAddDto
{
    [Required]
    public string ImageUrl { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class AdminImageReorderItemDto
{
    public int ImageId { get; set; }
    public int SortOrder { get; set; }
}
