using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Favorites;
using RealEstate.Api.Models;

namespace RealEstate.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public FavoritesController(ApplicationDbContext db)
    {
        _db = db;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var id))
        {
            return id;
        }
        throw new UnauthorizedAccessException("User identification claim is invalid.");
    }

    /// <summary>
    /// Retrieve all luxury properties saved to favorites by the current client.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<FavoriteDto>>> GetFavorites()
    {
        var userId = GetCurrentUserId();

        var favorites = await _db.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == userId && f.Property != null && f.Property.IsActive)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FavoriteDto
            {
                PropertyId = f.PropertyId,
                Title = f.Property!.Title,
                Price = f.Property.Price,
                ListingType = f.Property.ListingType,
                Address = f.Property.Address,
                City = f.Property.City,
                PropertyType = f.Property.PropertyType,
                Bedrooms = f.Property.Bedrooms,
                Bathrooms = f.Property.Bathrooms,
                SqFt = f.Property.SqFt,
                ImageUrl = f.Property.ImageUrl,
                Status = f.Property.Status,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync();

        return Ok(favorites);
    }

    /// <summary>
    /// Add a property to the client's favorites.
    /// </summary>
    [HttpPost("{propertyId:int}")]
    public async Task<IActionResult> AddFavorite(int propertyId)
    {
        var userId = GetCurrentUserId();

        var propertyExists = await _db.Properties.AnyAsync(p => p.PropertyId == propertyId && p.IsActive);
        if (!propertyExists)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Property Not Found",
                Detail = "The specified property does not exist or is inactive.",
                Status = StatusCodes.Status404NotFound
            });
        }

        var existingFavorite = await _db.Favorites.FindAsync(userId, propertyId);
        if (existingFavorite != null)
        {
            return Ok(new { message = "Property is already in your favorites." });
        }

        var favorite = new Favorite
        {
            UserId = userId,
            PropertyId = propertyId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Favorites.Add(favorite);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Property added to favorites." });
    }

    /// <summary>
    /// Remove a property from the client's favorites.
    /// </summary>
    [HttpDelete("{propertyId:int}")]
    public async Task<IActionResult> RemoveFavorite(int propertyId)
    {
        var userId = GetCurrentUserId();

        var existingFavorite = await _db.Favorites.FindAsync(userId, propertyId);
        if (existingFavorite == null)
        {
            return Ok(new { message = "Property was not in your favorites." });
        }

        _db.Favorites.Remove(existingFavorite);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Property removed from favorites." });
    }
}
