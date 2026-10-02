using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using RealEstate.Api.Common;
using RealEstate.Api.Settings;
using Serilog;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace RealEstate.Api.Services;

public class TwilioSmsSender : ISmsSender
{
    private readonly TwilioSettings _twilioSettings;
    private readonly IWebHostEnvironment _env;
    private bool _isInitialized = false;

    public TwilioSmsSender(IOptions<TwilioSettings> twilioSettings, IWebHostEnvironment env)
    {
        _twilioSettings = twilioSettings.Value;
        _env = env;
    }

    public async Task SendOtpSmsAsync(string toPhoneNumber, string code)
    {
        if (!_twilioSettings.IsConfigured)
        {
            if (_env.IsDevelopment())
            {
                Log.Warning("========================================================================");
                Log.Warning("📱 [SMS OTP DISPATCH - DEV CONSOLE]");
                Log.Warning("   Recipient: {Phone}", toPhoneNumber);
                Log.Warning("   OTP Code:  >>> {Code} <<<", code);
                Log.Warning("   (To receive actual SMS on your phone, set Twilio credentials");
                Log.Warning("    in backend/appsettings.Development.json)");
                Log.Warning("========================================================================");
                return;
            }

            EnsureConfigured();
        }

        var message = $"REAL ESTATE: your verification code is {code}. It expires in 5 minutes. Never share this code.";
        await SendSmsAsync(toPhoneNumber, message);
    }

    public async Task SendSmsAsync(string toPhoneNumber, string message)
    {
        EnsureConfigured();

        try
        {
            if (!_isInitialized)
            {
                TwilioClient.Init(_twilioSettings.AccountSid, _twilioSettings.AuthToken);
                _isInitialized = true;
            }

            var normalizedTo = PhoneNumberNormalizer.Normalize(toPhoneNumber);

            var messageResource = await MessageResource.CreateAsync(
                body: message,
                from: new PhoneNumber(_twilioSettings.FromNumber),
                to: new PhoneNumber(normalizedTo)
            );

            Log.Information("SMS successfully dispatched via Twilio SID: {Sid} to destination {MaskedPhone}", 
                messageResource.Sid, StringMasker.MaskPhone(normalizedTo));
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Twilio SMS dispatch failed for recipient {MaskedPhone}", StringMasker.MaskPhone(toPhoneNumber));
            throw new InvalidOperationException($"Unable to deliver SMS to recipient: {ex.Message}", ex);
        }
    }

    private void EnsureConfigured()
    {
        if (!_twilioSettings.IsConfigured)
        {
            var missing = new List<string>();
            if (string.IsNullOrWhiteSpace(_twilioSettings.AccountSid)) missing.Add("Twilio:AccountSid");
            if (string.IsNullOrWhiteSpace(_twilioSettings.AuthToken)) missing.Add("Twilio:AuthToken");
            if (string.IsNullOrWhiteSpace(_twilioSettings.FromNumber)) missing.Add("Twilio:FromNumber");

            var errorMsg = $"SMS dispatch failed: Missing configuration settings: {string.Join(", ", missing)}.";
            Log.Error(errorMsg);
            throw new ServiceUnavailableException(errorMsg);
        }
    }
}
