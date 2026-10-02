namespace RealEstate.Api.Settings;

public class AdminSeedSettings
{
    public const string SectionName = "AdminSeed";

    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(FullName) &&
        !string.IsNullOrWhiteSpace(Email) &&
        !string.IsNullOrWhiteSpace(Phone) &&
        !string.IsNullOrWhiteSpace(Password);
}
