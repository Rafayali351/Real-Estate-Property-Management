using RealEstate.Api.Models;

namespace RealEstate.Api.Services;

public interface INotificationService
{
    Task SendTourBookingReceivedAsync(TourBooking booking, Property property);
    Task SendAdminNewBookingAlertAsync(TourBooking booking, Property property, string adminEmail);
    Task SendTourBookingStatusChangedAsync(TourBooking booking, Property property, string status, string? adminNote = null);
    Task SendAdminNewInquiryAlertAsync(Inquiry inquiry, string adminEmail);
    Task SendInquiryReplyAsync(Inquiry inquiry, string replyText);
}
