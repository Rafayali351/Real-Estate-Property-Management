namespace RealEstate.Api.Settings;

public class CorsSettings
{
    public const string SectionName = "Cors";

    public string[] AllowedOrigins { get; set; } = ["http://localhost:3000", "http://127.0.0.1:3000"];
}
