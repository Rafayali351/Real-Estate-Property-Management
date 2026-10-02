using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Settings;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SettingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Retrieve the public company settings and social links.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PublicSiteSettingsDto>> GetSettings()
    {
        var settings = await _db.SiteSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.SettingsId == 1);

        if (settings == null)
        {
            return Ok(new PublicSiteSettingsDto
            {
                CompanyName = "REAL ESTATE",
                Tagline = "Exclusive Luxury Residences & Private Estates",
                ContactEmail = "concierge@realestate.com",
                ContactPhone = "+92 300 0000000",
                WhatsAppNumber = "+92 300 0000000",
                Address = "Diplomatic Enclave, Sector G-5, Islamabad, Pakistan",
                FacebookUrl = "https://facebook.com",
                InstagramUrl = "https://instagram.com",
                LinkedInUrl = "https://linkedin.com"
            });
        }

        return Ok(new PublicSiteSettingsDto
        {
            CompanyName = settings.CompanyName,
            Tagline = settings.Tagline,
            ContactEmail = settings.ContactEmail,
            ContactPhone = settings.ContactPhone,
            WhatsAppNumber = settings.WhatsAppNumber,
            Address = settings.Address,
            FacebookUrl = settings.FacebookUrl,
            InstagramUrl = settings.InstagramUrl,
            LinkedInUrl = settings.LinkedInUrl
        });
    }
}
