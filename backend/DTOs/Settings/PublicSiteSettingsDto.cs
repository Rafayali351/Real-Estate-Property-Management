namespace RealEstate.Api.DTOs.Settings;

public class PublicSiteSettingsDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? FacebookUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? LinkedInUrl { get; set; }
}
