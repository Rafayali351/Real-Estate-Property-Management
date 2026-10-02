using Microsoft.Extensions.Options;
using RealEstate.Api.Models;
using RealEstate.Api.Settings;
using Serilog;

namespace RealEstate.Api.Services;

public class NotificationService : INotificationService
{
    private readonly IEmailSender _emailSender;
    private readonly AppSettings _appSettings;

    public NotificationService(IEmailSender emailSender, IOptions<AppSettings> appSettings)
    {
        _emailSender = emailSender;
        _appSettings = appSettings.Value;
    }

    public async Task SendTourBookingReceivedAsync(TourBooking booking, Property property)
    {
        try
        {
            var brandName = "REAL ESTATE";
            var subject = $"{brandName} | Tour Booking Request Received - {property.Title}";
            var formattedDate = booking.PreferredDate.ToString("dddd, MMMM dd, yyyy 'at' hh:mm tt 'UTC'");

            var html = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Tour Booking Received</title>
</head>
<body style='margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;'>
    <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #121212; padding: 40px 20px;'>
        <tr>
            <td align='center'>
                <table width='100%' max-width='600' border='0' cellspacing='0' cellpadding='0' style='max-width: 600px; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 12px; overflow: hidden;'>
                    <tr>
                        <td style='padding: 36px 40px; text-align: center; border-bottom: 1px solid #2A2A2A;'>
                            <h1 style='margin: 0; font-size: 24px; letter-spacing: 4px; color: #D4AF37; text-transform: uppercase;'>{brandName}</h1>
                            <p style='margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase;'>Private Concierge & Luxury Estates</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 40px;'>
                            <h2 style='margin: 0 0 16px 0; font-size: 20px; color: #FFFFFF; font-weight: 500;'>Tour Booking Request Received</h2>
                            <p style='margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94A3B8;'>
                                Dear {booking.ClientName},<br><br>
                                Thank you for scheduling a private viewing for <strong>{property.Title}</strong>. Our dedicated property concierge is reviewing your request.
                            </p>
                            
                            <table width='100%' border='0' cellspacing='0' cellpadding='14' style='background-color: #121212; border: 1px solid #2A2A2A; border-radius: 8px; margin: 24px 0;'>
                                <tr>
                                    <td style='font-size: 13px; color: #94A3B8;'>Property:</td>
                                    <td style='font-size: 13px; color: #FFFFFF; font-weight: 600; text-align: right;'>{property.Title}</td>
                                </tr>
                                <tr>
                                    <td style='font-size: 13px; color: #94A3B8;'>Location:</td>
                                    <td style='font-size: 13px; color: #FFFFFF; text-align: right;'>{property.Address}, {property.City}</td>
                                </tr>
                                <tr>
                                    <td style='font-size: 13px; color: #94A3B8;'>Preferred Date:</td>
                                    <td style='font-size: 13px; color: #D4AF37; font-weight: 600; text-align: right;'>{formattedDate}</td>
                                </tr>
                                <tr>
                                    <td style='font-size: 13px; color: #94A3B8;'>Status:</td>
                                    <td style='font-size: 13px; color: #0EA5E9; font-weight: 600; text-align: right;'>Pending Confirmation</td>
                                </tr>
                            </table>

                            <p style='margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #94A3B8;'>
                                You can track the status of your bookings anytime in your client portal under <a href='{_appSettings.FrontendUrl}/my-tours' style='color: #D4AF37; text-decoration: underline;'>My Tours</a>.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 24px 40px; background-color: #141414; border-top: 1px solid #2A2A2A; text-align: center;'>
                            <p style='margin: 0; font-size: 12px; color: #64748B;'>
                                &copy; {DateTime.UtcNow.Year} {brandName}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

            var plainText = $"{brandName} - Tour Booking Request Received\n\nDear {booking.ClientName},\n\nWe have received your viewing request for {property.Title} on {formattedDate}.\nStatus: Pending Confirmation.\n\nTrack your booking: {_appSettings.FrontendUrl}/my-tours";

            await _emailSender.SendEmailAsync(booking.ClientEmail, subject, html, plainText);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Failed to dispatch tour booking confirmation email to client {ClientEmail}", booking.ClientEmail);
        }
    }

    public async Task SendAdminNewBookingAlertAsync(TourBooking booking, Property property, string adminEmail)
    {
        if (string.IsNullOrWhiteSpace(adminEmail)) return;

        try
        {
            var brandName = "REAL ESTATE";
            var subject = $"[{brandName}] [ACTION REQUIRED] New Tour Booking: {property.Title}";
            var formattedDate = booking.PreferredDate.ToString("dddd, MMMM dd, yyyy 'at' hh:mm tt 'UTC'");

            var html = $@"
<!DOCTYPE html>
<html>
<body style='background-color: #121212; font-family: sans-serif; color: #FFFFFF; padding: 30px;'>
    <div style='max-width: 600px; margin: auto; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 8px; padding: 30px;'>
        <h2 style='color: #D4AF37; margin-top: 0;'>{brandName} - New Tour Booking Scheduled</h2>
        <p style='color: #94A3B8;'>A new tour viewing has been booked through the public portal.</p>
        <hr style='border: none; border-top: 1px solid #2A2A2A;' />
        <p><strong>Property:</strong> {property.Title} (ID: #{property.PropertyId})</p>
        <p><strong>Location:</strong> {property.Address}, {property.City}</p>
        <p><strong>Client Name:</strong> {booking.ClientName}</p>
        <p><strong>Email:</strong> {booking.ClientEmail}</p>
        <p><strong>Phone:</strong> {booking.ClientPhone}</p>
        <p><strong>Preferred Date:</strong> {formattedDate}</p>
        <p><strong>Notes:</strong> {booking.Notes ?? "None"}</p>
        <p><a href='{_appSettings.FrontendUrl}/admin/bookings' style='display: inline-block; padding: 10px 20px; background-color: #D4AF37; color: #000; text-decoration: none; border-radius: 4px; font-weight: bold;'>Review in Admin Panel</a></p>
    </div>
</body>
</html>";

            var plainText = $"New tour scheduled for {property.Title} by {booking.ClientName} ({booking.ClientEmail}, {booking.ClientPhone}) on {formattedDate}. Notes: {booking.Notes}";

            await _emailSender.SendEmailAsync(adminEmail, subject, html, plainText);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Failed to dispatch tour alert to admin email {AdminEmail}", adminEmail);
        }
    }

    public async Task SendTourBookingStatusChangedAsync(TourBooking booking, Property property, string status, string? adminNote = null)
    {
        try
        {
            var brandName = "REAL ESTATE";
            var subject = $"{brandName} | Tour Booking Update: {status} - {property.Title}";
            var formattedDate = booking.PreferredDate.ToString("dddd, MMMM dd, yyyy 'at' hh:mm tt 'UTC'");

            var statusColor = status switch
            {
                "Confirmed" => "#059669",
                "Completed" => "#D4AF37",
                "Cancelled" => "#EF4444",
                _ => "#0EA5E9"
            };

            var noteSection = !string.IsNullOrWhiteSpace(adminNote)
                ? $@"<div style='background-color: #121212; border-left: 3px solid #D4AF37; padding: 12px 16px; margin: 20px 0;'>
                        <p style='margin: 0; font-size: 13px; color: #FFFFFF;'><strong>Concierge Note:</strong> {adminNote}</p>
                     </div>"
                : "";

            var html = $@"
<!DOCTYPE html>
<html>
<body style='margin: 0; padding: 0; background-color: #121212; font-family: sans-serif; color: #FFFFFF;'>
    <div style='max-width: 600px; margin: 40px auto; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 12px; padding: 36px;'>
        <h1 style='color: #D4AF37; font-size: 22px; letter-spacing: 2px; text-transform: uppercase; margin-top: 0;'>{brandName}</h1>
        <h2 style='color: #FFFFFF; font-size: 18px;'>Tour Booking Status Update: <span style='color: {statusColor};'>{status}</span></h2>
        <p style='color: #94A3B8; font-size: 14px;'>Dear {booking.ClientName},</p>
        <p style='color: #94A3B8; font-size: 14px;'>Your tour booking for <strong>{property.Title}</strong> scheduled for <strong>{formattedDate}</strong> is now marked as <strong>{status}</strong>.</p>
        {noteSection}
        <p style='color: #94A3B8; font-size: 13px;'>If you have questions or wish to reschedule, feel free to contact your private advisor.</p>
    </div>
</body>
</html>";

            var plainText = $"{brandName} Tour Booking Update\n\nYour viewing for {property.Title} on {formattedDate} has been updated to: {status}.\n{(string.IsNullOrWhiteSpace(adminNote) ? "" : $"Note: {adminNote}\n")}";

            await _emailSender.SendEmailAsync(booking.ClientEmail, subject, html, plainText);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Failed to dispatch tour status change email to client {ClientEmail}", booking.ClientEmail);
        }
    }

    public async Task SendAdminNewInquiryAlertAsync(Inquiry inquiry, string adminEmail)
    {
        if (string.IsNullOrWhiteSpace(adminEmail)) return;

        try
        {
            var brandName = "REAL ESTATE";
            var subject = $"[{brandName}] [NEW INQUIRY] {inquiry.Subject} - From {inquiry.Name}";

            var html = $@"
<!DOCTYPE html>
<html>
<body style='background-color: #121212; font-family: sans-serif; color: #FFFFFF; padding: 30px;'>
    <div style='max-width: 600px; margin: auto; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 8px; padding: 30px;'>
        <h2 style='color: #D4AF37; margin-top: 0;'>{brandName} - New Inquiry Received</h2>
        <p><strong>From:</strong> {inquiry.Name} ({inquiry.Email})</p>
        <p><strong>Phone:</strong> {inquiry.Phone ?? "Not specified"}</p>
        <p><strong>Subject:</strong> {inquiry.Subject}</p>
        <p><strong>Property ID:</strong> {(inquiry.PropertyId.HasValue ? inquiry.PropertyId.Value.ToString() : "General Inquiry")}</p>
        <div style='background-color: #121212; border-left: 3px solid #D4AF37; padding: 12px; margin: 20px 0;'>
            <p style='margin: 0; white-space: pre-wrap;'>{inquiry.Message}</p>
        </div>
        <p><a href='{_appSettings.FrontendUrl}/admin/inquiries' style='display: inline-block; padding: 10px 20px; background-color: #D4AF37; color: #000; text-decoration: none; border-radius: 4px; font-weight: bold;'>Reply in Admin Panel</a></p>
    </div>
</body>
</html>";

            var plainText = $"New Inquiry from {inquiry.Name} ({inquiry.Email}, {inquiry.Phone}):\nSubject: {inquiry.Subject}\n\nMessage:\n{inquiry.Message}";

            await _emailSender.SendEmailAsync(adminEmail, subject, html, plainText);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Failed to dispatch new inquiry alert to admin email {AdminEmail}", adminEmail);
        }
    }

    public async Task SendInquiryReplyAsync(Inquiry inquiry, string replyText)
    {
        try
        {
            var brandName = "REAL ESTATE";
            var subject = $"Re: {inquiry.Subject} | {brandName} Concierge";

            var html = $@"
<!DOCTYPE html>
<html>
<body style='background-color: #121212; font-family: sans-serif; color: #FFFFFF; padding: 30px;'>
    <div style='max-width: 600px; margin: auto; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 8px; padding: 30px;'>
        <h2 style='color: #D4AF37; margin-top: 0;'>{brandName}</h2>
        <p style='color: #94A3B8;'>Dear {inquiry.Name},</p>
        <p style='color: #94A3B8;'>Thank you for reaching out to us. Here is our response regarding your inquiry: <strong>{inquiry.Subject}</strong></p>
        <div style='background-color: #121212; border-left: 3px solid #D4AF37; padding: 16px; margin: 20px 0; color: #FFFFFF; line-height: 1.6; white-space: pre-wrap;'>{replyText}</div>
        <hr style='border: none; border-top: 1px solid #2A2A2A; margin: 24px 0;' />
        <p style='color: #64748B; font-size: 12px;'>Your original message:</p>
        <p style='color: #64748B; font-size: 12px; font-style: italic;'>{inquiry.Message}</p>
    </div>
</body>
</html>";

            var plainText = $"Dear {inquiry.Name},\n\nThank you for contacting {brandName}.\n\nResponse:\n{replyText}\n\n---\nOriginal message:\n{inquiry.Message}";

            await _emailSender.SendEmailAsync(inquiry.Email, subject, html, plainText);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Failed to dispatch inquiry reply to {InquiryEmail}", inquiry.Email);
        }
    }
}
