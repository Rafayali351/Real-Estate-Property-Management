using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Admin;
using RealEstate.Api.DTOs.Tours;

namespace RealEstate.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminDashboardController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboardMetrics()
    {
        var totalProps = await _db.Properties.CountAsync(p => p.IsActive);
        var availableProps = await _db.Properties.CountAsync(p => p.IsActive && p.Status == "Available");
        var pendingTours = await _db.TourBookings.CountAsync(t => t.Status == "Pending");
        var newInquiries = await _db.Inquiries.CountAsync(i => i.Status == "New");
        var registeredClients = await _db.Users.CountAsync(u => u.Role == "Client");

        // 30-day booking trend
        var thirtyDaysAgo = DateTime.UtcNow.Date.AddDays(-29);
        var bookingsLast30Days = await _db.TourBookings
            .AsNoTracking()
            .Where(b => b.CreatedAt >= thirtyDaysAgo)
            .GroupBy(b => b.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        var trendList = new List<DailyBookingStatDto>();
        for (var i = 0; i < 30; i++)
        {
            var day = thirtyDaysAgo.AddDays(i);
            var match = bookingsLast30Days.FirstOrDefault(b => b.Date == day);
            trendList.Add(new DailyBookingStatDto
            {
                Date = day.ToString("yyyy-MM-dd"),
                Count = match?.Count ?? 0
            });
        }

        // Latest 5 bookings
        var recentBookings = await _db.TourBookings
            .AsNoTracking()
            .Include(b => b.Property)
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => new TourBookingDto
            {
                BookingId = b.BookingId,
                PropertyId = b.PropertyId,
                PropertyTitle = b.Property != null ? b.Property.Title : "Estate",
                PropertyAddress = b.Property != null ? b.Property.Address : "",
                PropertyCity = b.Property != null ? b.Property.City : "",
                PropertyImageUrl = b.Property != null ? b.Property.ImageUrl : "",
                PropertyPrice = b.Property != null ? b.Property.Price : 0,
                PropertyListingType = b.Property != null ? b.Property.ListingType : "Sale",
                ClientName = b.ClientName,
                ClientEmail = b.ClientEmail,
                ClientPhone = b.ClientPhone,
                PreferredDate = b.PreferredDate,
                Notes = b.Notes,
                Status = b.Status,
                AdminNote = b.AdminNote,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        // Latest 5 inquiries
        var recentInquiries = await _db.Inquiries
            .AsNoTracking()
            .Include(i => i.Property)
            .OrderByDescending(i => i.CreatedAt)
            .Take(5)
            .Select(i => new InquiryItemDto
            {
                InquiryId = i.InquiryId,
                Name = i.Name,
                Email = i.Email,
                Phone = i.Phone,
                Subject = i.Subject,
                Message = i.Message,
                PropertyId = i.PropertyId,
                PropertyTitle = i.Property != null ? i.Property.Title : null,
                Status = i.Status,
                ReplyMessage = i.ReplyMessage,
                RepliedAt = i.RepliedAt,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return Ok(new AdminDashboardDto
        {
            TotalProperties = totalProps,
            AvailableProperties = availableProps,
            PendingTours = pendingTours,
            NewInquiries = newInquiries,
            RegisteredClients = registeredClients,
            BookingsTrend = trendList,
            RecentBookings = recentBookings,
            RecentInquiries = recentInquiries
        });
    }
}
