namespace RealEstate.Api.Services;

public interface ISmsSender
{
    Task SendSmsAsync(string toPhoneNumber, string message);
    Task SendOtpSmsAsync(string toPhoneNumber, string code);
}
