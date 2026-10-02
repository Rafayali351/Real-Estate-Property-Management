using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Tours;
using RealEstate.Api.Models;
using RealEstate.Api.Services;

namespace RealEstate.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ToursController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notificationService;

    public ToursController(ApplicationDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var id))
        {
            return id;
        }
        throw new UnauthorizedAccessException("User identification claim is invalid.");
    }

    /// <summary>
    /// Schedule a private viewing for an available luxury property.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> BookTour([FromBody] BookTourRequestDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
        {
            return Unauthorized();
        }

        // Validate future date
        if (dto.PreferredDate <= DateTime.UtcNow.AddMinutes(30))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Tour Date",
                Detail = "Tour booking preferred date must be scheduled at least 30 minutes in the future.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Validate Property
        var property = await _db.Properties
            .FirstOrDefaultAsync(p => p.PropertyId == dto.PropertyId && p.IsActive);

        if (property == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Property Not Found",
                Detail = "The specified property does not exist or is inactive.",
                Status = StatusCodes.Status404NotFound
            });
        }

        if (property.Status == "Sold" || property.Status == "Rented")
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Property Unavailable",
                Detail = $"This property is currently marked as {property.Status} and cannot be toured.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Check for duplicate pending tour
        var hasPendingBooking = await _db.TourBookings
            .AnyAsync(b => b.UserId == userId && b.PropertyId == dto.PropertyId && b.Status == "Pending");

        if (hasPendingBooking)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Tour Already Requested",
                Detail = "You already have a pending tour booking request for this property.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var clientName = !string.IsNullOrWhiteSpace(dto.ClientName) ? dto.ClientName.Trim() : user.FullName;
        var clientEmail = !string.IsNullOrWhiteSpace(dto.ClientEmail) ? dto.ClientEmail.Trim().ToLowerInvariant() : user.Email;
        var clientPhone = !string.IsNullOrWhiteSpace(dto.ClientPhone) ? dto.ClientPhone.Trim() : user.Phone;

        var booking = new TourBooking
        {
            UserId = userId,
            PropertyId = dto.PropertyId,
            ClientName = clientName,
            ClientEmail = clientEmail,
            ClientPhone = clientPhone,
            PreferredDate = dto.PreferredDate,
            Notes = dto.Notes?.Trim(),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.TourBookings.Add(booking);
        await _db.SaveChangesAsync();

        // Dispatch emails in background safely
        var siteSettings = await _db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.SettingsId == 1);
        var adminEmail = siteSettings?.ContactEmail;

        _ = Task.Run(async () =>
        {
            await _notificationService.SendTourBookingReceivedAsync(booking, property);
            if (!string.IsNullOrWhiteSpace(adminEmail))
            {
                await _notificationService.SendAdminNewBookingAlertAsync(booking, property, adminEmail);
            }
        });

        return Ok(new
        {
            message = "Your private viewing has been requested. Our concierge will confirm shortly.",
            bookingId = booking.BookingId
        });
    }

    /// <summary>
    /// Retrieve all tour bookings for the current client.
    /// </summary>
    [HttpGet("my")]
    public async Task<ActionResult<List<TourBookingDto>>> GetMyTours()
    {
        var userId = GetCurrentUserId();

        var bookings = await _db.TourBookings
            .AsNoTracking()
            .Include(b => b.Property)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new TourBookingDto
            {
                BookingId = b.BookingId,
                PropertyId = b.PropertyId,
                PropertyTitle = b.Property != null ? b.Property.Title : "Estate Listing",
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

        return Ok(bookings);
    }

    /// <summary>
    /// Cancel a tour booking if currently Pending or Confirmed.
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> CancelTour(int id)
    {
        var userId = GetCurrentUserId();

        var booking = await _db.TourBookings
            .Include(b => b.Property)
            .FirstOrDefaultAsync(b => b.BookingId == id && b.UserId == userId);

        if (booking == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Booking Not Found",
                Detail = "The specified booking does not exist or does not belong to you.",
                Status = StatusCodes.Status404NotFound
            });
        }

        if (booking.Status == "Completed")
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Cannot Cancel",
                Detail = "Completed tours cannot be cancelled.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (booking.Status == "Cancelled")
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Already Cancelled",
                Detail = "This tour booking is already cancelled.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        booking.Status = "Cancelled";
        booking.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        if (booking.Property != null)
        {
            _ = Task.Run(async () =>
            {
                await _notificationService.SendTourBookingStatusChangedAsync(booking, booking.Property, "Cancelled", "Cancelled by client.");
            });
        }

        return Ok(new { message = "Tour booking successfully cancelled." });
    }
}
