namespace RealEstate.Api.DTOs.Stats;

public class PublicStatsDto
{
    public int ActiveListings { get; set; }
    public int SoldOrRented { get; set; }
    public int CitiesCovered { get; set; }
    public int RegisteredClients { get; set; }
}
