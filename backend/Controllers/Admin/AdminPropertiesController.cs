using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Admin;
using RealEstate.Api.DTOs.Common;
using RealEstate.Api.DTOs.Properties;
using RealEstate.Api.Models;

namespace RealEstate.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/properties")]
public class AdminPropertiesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminPropertiesController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Search and list properties for the admin management table.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<PropertySummaryDto>>> GetProperties([FromQuery] PropertyListQueryDto query)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 10 : query.PageSize;

        var q = _db.Properties
            .AsNoTracking()
            .Include(p => p.Agent)
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            q = q.Where(p => p.Title.ToLower().Contains(search)
                          || p.Address.ToLower().Contains(search)
                          || p.City.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.City))
        {
            var city = query.City.Trim().ToLower();
            q = q.Where(p => p.City.ToLower() == city);
        }

        if (!string.IsNullOrWhiteSpace(query.PropertyType))
        {
            var pType = query.PropertyType.Trim().ToLower();
            q = q.Where(p => p.PropertyType.ToLower() == pType);
        }

        if (!string.IsNullOrWhiteSpace(query.ListingType))
        {
            var lType = query.ListingType.Trim().ToLower();
            q = q.Where(p => p.ListingType.ToLower() == lType);
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var status = query.Status.Trim().ToLower();
            q = q.Where(p => p.Status.ToLower() == status);
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(p => p.CreatedAt)
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
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// Retrieve single property details with images for editing.
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
                Status = StatusCodes.Status404NotFound
            });
        }

        return Ok(new PropertyDetailDto
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
            Agent = property.Agent != null ? new DTOs.Agents.AgentDto
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
                .ToList()
        });
    }

    /// <summary>
    /// Create a new luxury estate listing.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProperty([FromBody] AdminPropertyCreateUpdateDto dto)
    {
        var property = new Property
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Price = dto.Price,
            ListingType = dto.ListingType,
            Address = dto.Address.Trim(),
            City = dto.City.Trim(),
            PropertyType = dto.PropertyType.Trim(),
            Bedrooms = dto.Bedrooms,
            Bathrooms = dto.Bathrooms,
            SqFt = dto.SqFt,
            ImageUrl = dto.ImageUrl.Trim(),
            IsFeatured = dto.IsFeatured,
            Status = dto.Status,
            AgentId = dto.AgentId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (dto.GalleryImageUrls != null && dto.GalleryImageUrls.Count > 0)
        {
            var sort = 1;
            foreach (var img in dto.GalleryImageUrls)
            {
                if (!string.IsNullOrWhiteSpace(img))
                {
                    property.Images.Add(new PropertyImage
                    {
                        ImageUrl = img.Trim(),
                        SortOrder = sort++,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        _db.Properties.Add(property);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProperty), new { id = property.PropertyId }, new { id = property.PropertyId, message = "Property created successfully." });
    }

    /// <summary>
    /// Update an existing property.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProperty(int id, [FromBody] AdminPropertyCreateUpdateDto dto)
    {
        var property = await _db.Properties.FindAsync(id);
        if (property == null || !property.IsActive)
        {
            return NotFound();
        }

        property.Title = dto.Title.Trim();
        property.Description = dto.Description.Trim();
        property.Price = dto.Price;
        property.ListingType = dto.ListingType;
        property.Address = dto.Address.Trim();
        property.City = dto.City.Trim();
        property.PropertyType = dto.PropertyType.Trim();
        property.Bedrooms = dto.Bedrooms;
        property.Bathrooms = dto.Bathrooms;
        property.SqFt = dto.SqFt;
        property.ImageUrl = dto.ImageUrl.Trim();
        property.IsFeatured = dto.IsFeatured;
        property.Status = dto.Status;
        property.AgentId = dto.AgentId;
        property.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Property updated successfully." });
    }

    /// <summary>
    /// Soft delete a property (sets IsActive = false).
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProperty(int id)
    {
        var property = await _db.Properties.FindAsync(id);
        if (property == null || !property.IsActive)
        {
            return NotFound();
        }

        property.IsActive = false;
        property.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Property deleted successfully." });
    }

    /// <summary>
    /// Add an image to the property's gallery.
    /// </summary>
    [HttpPost("{id:int}/images")]
    public async Task<IActionResult> AddGalleryImage(int id, [FromBody] AdminImageAddDto dto)
    {
        var property = await _db.Properties.Include(p => p.Images).FirstOrDefaultAsync(p => p.PropertyId == id && p.IsActive);
        if (property == null) return NotFound();

        var sortOrder = dto.SortOrder > 0 ? dto.SortOrder : property.Images.Count + 1;
        var image = new PropertyImage
        {
            PropertyId = id,
            ImageUrl = dto.ImageUrl.Trim(),
            SortOrder = sortOrder,
            CreatedAt = DateTime.UtcNow
        };

        _db.PropertyImages.Add(image);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Gallery image added successfully.", imageId = image.ImageId });
    }

    /// <summary>
    /// Reorder gallery images.
    /// </summary>
    [HttpPut("{id:int}/images")]
    public async Task<IActionResult> ReorderGalleryImages(int id, [FromBody] List<AdminImageReorderItemDto> items)
    {
        var propertyImages = await _db.PropertyImages.Where(img => img.PropertyId == id).ToListAsync();
        foreach (var item in items)
        {
            var target = propertyImages.FirstOrDefault(i => i.ImageId == item.ImageId);
            if (target != null)
            {
                target.SortOrder = item.SortOrder;
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Images reordered successfully." });
    }

    /// <summary>
    /// Remove an image from the gallery.
    /// </summary>
    [HttpDelete("{id:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteGalleryImage(int id, int imageId)
    {
        var image = await _db.PropertyImages.FirstOrDefaultAsync(img => img.PropertyId == id && img.ImageId == imageId);
        if (image == null) return NotFound();

        _db.PropertyImages.Remove(image);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Gallery image removed successfully." });
    }
}
