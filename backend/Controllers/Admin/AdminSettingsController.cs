using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Admin;
using RealEstate.Api.Models;

namespace RealEstate.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/settings")]
public class AdminSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminSettingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] AdminUpdateSettingsDto dto)
    {
        var settings = await _db.SiteSettings.FirstOrDefaultAsync(s => s.SettingsId == 1);
        if (settings == null)
        {
            settings = new SiteSetting
            {
                SettingsId = 1
            };
            _db.SiteSettings.Add(settings);
        }

        settings.CompanyName = dto.CompanyName.Trim();
        settings.Tagline = dto.Tagline.Trim();
        settings.ContactEmail = dto.ContactEmail.Trim().ToLowerInvariant();
        settings.ContactPhone = dto.ContactPhone.Trim();
        settings.WhatsAppNumber = dto.WhatsAppNumber.Trim();
        settings.Address = dto.Address.Trim();
        settings.FacebookUrl = dto.FacebookUrl?.Trim();
        settings.InstagramUrl = dto.InstagramUrl?.Trim();
        settings.LinkedInUrl = dto.LinkedInUrl?.Trim();
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Site settings updated successfully." });
    }
}
