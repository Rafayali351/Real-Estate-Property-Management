namespace RealEstate.Api.Services;

public interface IEmailSender
{
    Task SendEmailAsync(string toEmail, string subject, string htmlContent, string plainTextContent);
    Task SendOtpEmailAsync(string toEmail, string code);
    Task SendNotificationEmailAsync(string toEmail, string subject, string title, string messageBody, string? actionButtonText = null, string? actionButtonUrl = null);
}
