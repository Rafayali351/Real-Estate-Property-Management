namespace RealEstate.Api.DTOs.Properties;

public class PropertyImageDto
{
    public int ImageId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
