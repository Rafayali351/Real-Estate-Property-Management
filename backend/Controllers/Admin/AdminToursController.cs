using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Admin;
using RealEstate.Api.DTOs.Common;
using RealEstate.Api.DTOs.Tours;
using RealEstate.Api.Services;

namespace RealEstate.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/tours")]
public class AdminToursController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notificationService;

    public AdminToursController(ApplicationDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TourBookingDto>>> GetTours(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var p = page < 1 ? 1 : page;
        var ps = pageSize is < 1 or > 100 ? 15 : pageSize;

        var q = _db.TourBookings
            .AsNoTracking()
            .Include(t => t.Property)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var st = status.Trim();
            q = q.Where(t => t.Status.ToLower() == st.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            q = q.Where(t => t.ClientName.ToLower().Contains(term)
                          || t.ClientEmail.ToLower().Contains(term)
                          || t.ClientPhone.ToLower().Contains(term)
                          || (t.Property != null && t.Property.Title.ToLower().Contains(term)));
        }

        if (fromDate.HasValue)
        {
            q = q.Where(t => t.PreferredDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            q = q.Where(t => t.PreferredDate <= toDate.Value);
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(t => t.CreatedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .Select(t => new TourBookingDto
            {
                BookingId = t.BookingId,
                PropertyId = t.PropertyId,
                PropertyTitle = t.Property != null ? t.Property.Title : "Estate",
                PropertyAddress = t.Property != null ? t.Property.Address : "",
                PropertyCity = t.Property != null ? t.Property.City : "",
                PropertyImageUrl = t.Property != null ? t.Property.ImageUrl : "",
                PropertyPrice = t.Property != null ? t.Property.Price : 0,
                PropertyListingType = t.Property != null ? t.Property.ListingType : "Sale",
                ClientName = t.ClientName,
                ClientEmail = t.ClientEmail,
                ClientPhone = t.ClientPhone,
                PreferredDate = t.PreferredDate,
                Notes = t.Notes,
                Status = t.Status,
                AdminNote = t.AdminNote,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(new PagedResultDto<TourBookingDto>
        {
            Items = items,
            TotalCount = total,
            Page = p,
            PageSize = ps
        });
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateTourStatus(int id, [FromBody] AdminUpdateTourStatusDto dto)
    {
        var booking = await _db.TourBookings
            .Include(t => t.Property)
            .FirstOrDefaultAsync(t => t.BookingId == id);

        if (booking == null) return NotFound();

        booking.Status = dto.Status.Trim();
        booking.AdminNote = dto.AdminNote?.Trim();
        booking.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        if (booking.Property != null)
        {
            _ = Task.Run(async () =>
            {
                await _notificationService.SendTourBookingStatusChangedAsync(
                    booking,
                    booking.Property,
                    booking.Status,
                    booking.AdminNote
                );
            });
        }

        return Ok(new { message = $"Tour booking updated to {booking.Status}." });
    }
}
