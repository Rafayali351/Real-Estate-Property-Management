using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Stats;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public StatsController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Live statistical metrics dynamically computed from the database.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PublicStatsDto>> GetStats()
    {
        var activeListings = await _db.Properties
            .AsNoTracking()
            .CountAsync(p => p.IsActive);

        var soldOrRented = await _db.Properties
            .AsNoTracking()
            .CountAsync(p => p.IsActive && (p.Status == "Sold" || p.Status == "Rented"));

        var citiesCovered = await _db.Properties
            .AsNoTracking()
            .Where(p => p.IsActive && !string.IsNullOrWhiteSpace(p.City))
            .Select(p => p.City.Trim().ToLower())
            .Distinct()
            .CountAsync();

        var registeredClients = await _db.Users
            .AsNoTracking()
            .CountAsync(u => u.Role == "Client" && u.IsActive);

        return Ok(new PublicStatsDto
        {
            ActiveListings = activeListings,
            SoldOrRented = soldOrRented,
            CitiesCovered = citiesCovered,
            RegisteredClients = registeredClients
        });
    }
}
