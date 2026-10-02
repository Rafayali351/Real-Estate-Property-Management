namespace RealEstate.Api.Settings;

public class AppSettings
{
    public const string SectionName = "App";

    public string FrontendUrl { get; set; } = "http://localhost:3000";
    public string PublicApiUrl { get; set; } = "http://localhost:5000";
}
