using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Inquiries;
using RealEstate.Api.Models;
using RealEstate.Api.Services;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InquiriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notificationService;

    public InquiriesController(ApplicationDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    /// <summary>
    /// Submit a client inquiry or property inquiry.
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("InquiryLimiter")]
    public async Task<IActionResult> CreateInquiry([FromBody] CreateInquiryDto dto)
    {
        if (dto.PropertyId.HasValue)
        {
            var propertyExists = await _db.Properties.AnyAsync(p => p.PropertyId == dto.PropertyId.Value && p.IsActive);
            if (!propertyExists)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Property",
                    Detail = "The referenced property could not be found or is inactive.",
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        var inquiry = new Inquiry
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Phone = dto.Phone?.Trim(),
            Subject = dto.Subject.Trim(),
            Message = dto.Message.Trim(),
            PropertyId = dto.PropertyId,
            Status = "New",
            CreatedAt = DateTime.UtcNow
        };

        _db.Inquiries.Add(inquiry);
        await _db.SaveChangesAsync();

        // Dispatch alert to SiteSettings ContactEmail in background/safely
        var siteSettings = await _db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.SettingsId == 1);
        var adminEmail = siteSettings?.ContactEmail;

        if (!string.IsNullOrWhiteSpace(adminEmail))
        {
            _ = Task.Run(async () =>
            {
                await _notificationService.SendAdminNewInquiryAlertAsync(inquiry, adminEmail);
            });
        }

        return Ok(new
        {
            message = "Your inquiry has been safely received. A luxury concierge will contact you shortly.",
            inquiryId = inquiry.InquiryId
        });
    }
}
