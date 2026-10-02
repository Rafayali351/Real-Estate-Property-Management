using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using MimeKit;
using RealEstate.Api.Common;
using RealEstate.Api.Settings;
using Serilog;

namespace RealEstate.Api.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly SmtpSettings _smtpSettings;
    private readonly IWebHostEnvironment _env;

    public SmtpEmailSender(IOptions<SmtpSettings> smtpSettings, IWebHostEnvironment env)
    {
        _smtpSettings = smtpSettings.Value;
        _env = env;
    }

    public async Task SendOtpEmailAsync(string toEmail, string code)
    {
        if (!_smtpSettings.IsConfigured)
        {
            if (_env.IsDevelopment())
            {
                Log.Warning("========================================================================");
                Log.Warning("✉️ [EMAIL OTP DISPATCH - DEV CONSOLE]");
                Log.Warning("   Recipient: {Email}", toEmail);
                Log.Warning("   OTP Code:  >>> {Code} <<<", code);
                Log.Warning("   (To receive actual emails in your inbox, set Gmail App Password");
                Log.Warning("    in backend/appsettings.Development.json)");
                Log.Warning("========================================================================");
                return;
            }

            EnsureConfigured();
        }

        var subject = $"REAL ESTATE - Your One-Time Verification Code [{code[..3]}-{code[3..]}]";

        var html = $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>{subject}</title>
</head>
<body style='margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;'>
  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color: #121212; padding: 40px 15px;'>
    <tr>
      <td align='center'>
        <table role='presentation' width='100%' style='max-width: 580px; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);' cellspacing='0' cellpadding='0' border='0'>
          <!-- Header -->
          <tr>
            <td align='center' style='padding: 35px 30px 20px 30px; border-bottom: 1px solid #262626;'>
              <h1 style='margin: 0; font-size: 24px; letter-spacing: 4px; font-weight: 700; color: #D4AF37; text-transform: uppercase;'>REAL ESTATE</h1>
              <p style='margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase;'>Ultra-Luxury & Property Management</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style='padding: 35px 40px 30px 40px; text-align: center;'>
              <h2 style='margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #FFFFFF;'>Security Verification Code</h2>
              <p style='margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #94A3B8;'>
                Please enter the one-time authentication code below to verify your identity and access your bespoke portfolio.
              </p>
              
              <!-- Code Card -->
              <div style='background: #121212; border: 1px solid #D4AF37; border-radius: 12px; padding: 22px 15px; margin: 0 auto 28px auto; max-width: 320px;'>
                <div style='font-size: 38px; font-weight: 700; letter-spacing: 12px; color: #D4AF37; text-align: center; margin-left: 12px;'>
                  {code}
                </div>
              </div>

              <div style='display: inline-block; background-color: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 8px 16px; font-size: 13px; color: #D4AF37; margin-bottom: 25px;'>
                ⏱️ Code expires in <strong>2 minutes</strong>
              </div>

              <p style='margin: 0; font-size: 12px; line-height: 1.6; color: #64748B;'>
                If you did not request this verification code, please disregard this communication or contact our concierge immediately. Never disclose this code to anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style='padding: 20px 40px; background-color: #141414; border-top: 1px solid #222222; text-align: center;'>
              <p style='margin: 0; font-size: 11px; color: #64748B;'>
                &copy; {DateTime.UtcNow.Year} REAL ESTATE Management. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        var plainText = $@"
REAL ESTATE - Verification Code

Your authentication code is: {code}

This code expires in 5 minutes.
Never share this code with anyone. If you did not request this code, please ignore this message.

© {DateTime.UtcNow.Year} REAL ESTATE";

        await SendEmailAsync(toEmail, subject, html, plainText);
    }

    public async Task SendNotificationEmailAsync(
        string toEmail, 
        string subject, 
        string title, 
        string messageBody, 
        string? actionButtonText = null, 
        string? actionButtonUrl = null)
    {
        if (!_smtpSettings.IsConfigured)
        {
            Log.Warning("Cannot send notification email to {MaskedEmail} because SMTP is not configured.", 
                Common.StringMasker.MaskEmail(toEmail));
            return;
        }

        var actionButtonHtml = string.Empty;
        if (!string.IsNullOrWhiteSpace(actionButtonText) && !string.IsNullOrWhiteSpace(actionButtonUrl))
        {
            actionButtonHtml = $@"
              <div style='margin: 30px 0;'>
                <a href='{actionButtonUrl}' style='background-color: #D4AF37; color: #121212; padding: 12px 28px; text-decoration: none; font-weight: 700; border-radius: 8px; display: inline-block; font-size: 14px; letter-spacing: 1px;'>
                  {actionButtonText}
                </a>
              </div>";
        }

        var html = $@"
<!DOCTYPE html>
<html>
<body style='margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;'>
  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color: #121212; padding: 40px 15px;'>
    <tr>
      <td align='center'>
        <table role='presentation' width='100%' style='max-width: 580px; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 16px; overflow: hidden;' cellspacing='0' cellpadding='0' border='0'>
          <tr>
            <td align='center' style='padding: 30px 30px 15px 30px; border-bottom: 1px solid #262626;'>
              <h1 style='margin: 0; font-size: 22px; letter-spacing: 3px; font-weight: 700; color: #D4AF37;'>REAL ESTATE</h1>
            </td>
          </tr>
          <tr>
            <td style='padding: 30px 40px; text-align: left;'>
              <h2 style='margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #FFFFFF;'>{title}</h2>
              <div style='font-size: 14px; line-height: 1.7; color: #94A3B8; white-space: pre-line;'>
                {messageBody}
              </div>
              {actionButtonHtml}
            </td>
          </tr>
          <tr>
            <td style='padding: 20px 40px; background-color: #141414; border-top: 1px solid #222222; text-align: center;'>
              <p style='margin: 0; font-size: 11px; color: #64748B;'>
                &copy; {DateTime.UtcNow.Year} REAL ESTATE Concierge Advisory.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        var plainText = $"{title}\n\n{messageBody}\n\n© {DateTime.UtcNow.Year} REAL ESTATE";

        try
        {
            await SendEmailAsync(toEmail, subject, html, plainText);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to send notification email to {MaskedEmail}", Common.StringMasker.MaskEmail(toEmail));
        }
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlContent, string plainTextContent)
    {
        EnsureConfigured();

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
        message.To.Add(new MailboxAddress(toEmail, toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = htmlContent,
            TextBody = plainTextContent
        };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            // Connect using STARTTLS
            await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);

            if (!string.IsNullOrWhiteSpace(_smtpSettings.Username) && !string.IsNullOrWhiteSpace(_smtpSettings.Password))
            {
                await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            Log.Information("Email successfully dispatched to {MaskedEmail}. Subject: {Subject}",
                Common.StringMasker.MaskEmail(toEmail), subject);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "SMTP error dispatching email to {MaskedEmail} via {Host}:{Port}",
                Common.StringMasker.MaskEmail(toEmail), _smtpSettings.Host, _smtpSettings.Port);
            throw new InvalidOperationException($"Unable to deliver email to {Common.StringMasker.MaskEmail(toEmail)}: {ex.Message}", ex);
        }
    }

    private void EnsureConfigured()
    {
        if (!_smtpSettings.IsConfigured)
        {
            var missing = new List<string>();
            if (string.IsNullOrWhiteSpace(_smtpSettings.Host)) missing.Add("Smtp:Host");
            if (string.IsNullOrWhiteSpace(_smtpSettings.FromEmail)) missing.Add("Smtp:FromEmail");

            var errorMsg = $"Email dispatch failed: Missing configuration settings: {string.Join(", ", missing)}.";
            Log.Error(errorMsg);
            throw new ServiceUnavailableException(errorMsg);
        }
    }
}
