using RealEstate.Api.DTOs.Inquiries;
using RealEstate.Api.DTOs.Tours;

namespace RealEstate.Api.DTOs.Admin;

public class DailyBookingStatDto
{
    public string Date { get; set; } = string.Empty; // YYYY-MM-DD
    public int Count { get; set; }
}

public class AdminDashboardDto
{
    public int TotalProperties { get; set; }
    public int AvailableProperties { get; set; }
    public int PendingTours { get; set; }
    public int NewInquiries { get; set; }
    public int RegisteredClients { get; set; }

    public List<DailyBookingStatDto> BookingsTrend { get; set; } = new();
    public List<TourBookingDto> RecentBookings { get; set; } = new();
    public List<InquiryItemDto> RecentInquiries { get; set; } = new();
}

public class InquiryItemDto
{
    public int InquiryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? PropertyId { get; set; }
    public string? PropertyTitle { get; set; }
    public string Status { get; set; } = "New";
    public string? ReplyMessage { get; set; }
    public DateTime? RepliedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
