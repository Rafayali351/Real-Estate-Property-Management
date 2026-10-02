using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Agents;
using RealEstate.Api.DTOs.Common;
using RealEstate.Api.DTOs.Properties;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PropertiesController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Search and filter active luxury properties with sorting and pagination.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<PropertySummaryDto>>> GetProperties([FromQuery] PropertyListQueryDto query)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 50 ? 9 : query.PageSize;

        var q = _db.Properties
            .AsNoTracking()
            .Include(p => p.Agent)
            .Where(p => p.IsActive);

        // Search text
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            q = q.Where(p => p.Title.ToLower().Contains(search)
                          || p.Description.ToLower().Contains(search)
                          || p.Address.ToLower().Contains(search)
                          || p.City.ToLower().Contains(search));
        }

        // City filter
        if (!string.IsNullOrWhiteSpace(query.City))
        {
            var city = query.City.Trim();
            q = q.Where(p => p.City.ToLower() == city.ToLower());
        }

        // Property type filter
        if (!string.IsNullOrWhiteSpace(query.PropertyType))
        {
            var pType = query.PropertyType.Trim();
            q = q.Where(p => p.PropertyType.ToLower() == pType.ToLower());
        }

        // Listing type filter (Sale / Rent)
        if (!string.IsNullOrWhiteSpace(query.ListingType))
        {
            var lType = query.ListingType.Trim();
            q = q.Where(p => p.ListingType.ToLower() == lType.ToLower());
        }

        // Min & Max Price
        if (query.MinPrice.HasValue)
        {
            q = q.Where(p => p.Price >= query.MinPrice.Value);
        }
        if (query.MaxPrice.HasValue)
        {
            q = q.Where(p => p.Price <= query.MaxPrice.Value);
        }

        // Bedrooms
        if (query.Bedrooms.HasValue)
        {
            q = q.Where(p => p.Bedrooms >= query.Bedrooms.Value);
        }

        // Featured only
        if (query.IsFeatured.HasValue)
        {
            q = q.Where(p => p.IsFeatured == query.IsFeatured.Value);
        }

        // Status filter
        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var st = query.Status.Trim();
            q = q.Where(p => p.Status.ToLower() == st.ToLower());
        }

        // Sorting
        q = query.SortBy?.ToLowerInvariant() switch
        {
            "price_asc" => q.OrderBy(p => p.Price),
            "price_desc" => q.OrderByDescending(p => p.Price),
            "featured" => q.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt),
            _ => q.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await q.CountAsync();

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PropertySummaryDto
            {
                PropertyId = p.PropertyId,
                Title = p.Title,
                Price = p.Price,
                ListingType = p.ListingType,
                Address = p.Address,
                City = p.City,
                PropertyType = p.PropertyType,
                Bedrooms = p.Bedrooms,
                Bathrooms = p.Bathrooms,
                SqFt = p.SqFt,
                ImageUrl = p.ImageUrl,
                IsFeatured = p.IsFeatured,
                Status = p.Status,
                AgentId = p.AgentId,
                AgentName = p.Agent != null ? p.Agent.FullName : null,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Ok(new PagedResultDto<PropertySummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// Retrieve single property details with gallery, assigned agent, and 3 similar listings.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PropertyDetailDto>> GetProperty(int id)
    {
        var property = await _db.Properties
            .AsNoTracking()
            .Include(p => p.Agent)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.PropertyId == id && p.IsActive);

        if (property == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Property Not Found",
                Detail = $"Property with ID {id} was not found or is no longer active.",
                Status = StatusCodes.Status404NotFound
            });
        }

        // Similar properties: same city or type, active, excluding current
        var similar = await _db.Properties
            .AsNoTracking()
            .Include(p => p.Agent)
            .Where(p => p.IsActive && p.PropertyId != id && (p.City == property.City || p.PropertyType == property.PropertyType))
            .OrderByDescending(p => p.IsFeatured)
            .ThenByDescending(p => p.CreatedAt)
            .Take(3)
            .Select(p => new PropertySummaryDto
            {
                PropertyId = p.PropertyId,
                Title = p.Title,
                Price = p.Price,
                ListingType = p.ListingType,
                Address = p.Address,
                City = p.City,
                PropertyType = p.PropertyType,
                Bedrooms = p.Bedrooms,
                Bathrooms = p.Bathrooms,
                SqFt = p.SqFt,
                ImageUrl = p.ImageUrl,
                IsFeatured = p.IsFeatured,
                Status = p.Status,
                AgentId = p.AgentId,
                AgentName = p.Agent != null ? p.Agent.FullName : null,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        // Check if currently favorited by authenticated user
        var isFavorited = false;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdClaim, out var userId))
        {
            isFavorited = await _db.Favorites.AnyAsync(f => f.UserId == userId && f.PropertyId == id);
        }

        var dto = new PropertyDetailDto
        {
            PropertyId = property.PropertyId,
            Title = property.Title,
            Description = property.Description,
            Price = property.Price,
            ListingType = property.ListingType,
            Address = property.Address,
            City = property.City,
            PropertyType = property.PropertyType,
            Bedrooms = property.Bedrooms,
            Bathrooms = property.Bathrooms,
            SqFt = property.SqFt,
            ImageUrl = property.ImageUrl,
            IsFeatured = property.IsFeatured,
            Status = property.Status,
            CreatedAt = property.CreatedAt,
            UpdatedAt = property.UpdatedAt,
            IsFavorited = isFavorited,
            Agent = property.Agent != null ? new AgentDto
            {
                AgentId = property.Agent.AgentId,
                FullName = property.Agent.FullName,
                Email = property.Agent.Email,
                Phone = property.Agent.Phone,
                Specialization = property.Agent.Specialization,
                Bio = property.Agent.Bio,
                ProfileImgUrl = property.Agent.ProfileImgUrl
            } : null,
            Images = property.Images
                .OrderBy(img => img.SortOrder)
                .Select(img => new PropertyImageDto
                {
                    ImageId = img.ImageId,
                    ImageUrl = img.ImageUrl,
                    SortOrder = img.SortOrder
                })
                .ToList(),
            SimilarProperties = similar
        };

        return Ok(dto);
    }

    /// <summary>
    /// Distinct cities for filter dropdowns.
    /// </summary>
    [HttpGet("cities")]
    public async Task<ActionResult<List<string>>> GetCities()
    {
        var cities = await _db.Properties
            .AsNoTracking()
            .Where(p => p.IsActive && !string.IsNullOrWhiteSpace(p.City))
            .Select(p => p.City)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(cities);
    }
}
