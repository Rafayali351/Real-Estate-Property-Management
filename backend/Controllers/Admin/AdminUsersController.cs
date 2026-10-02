using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Admin;
using RealEstate.Api.DTOs.Common;

namespace RealEstate.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminUsersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<AdminUserDto>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var p = page < 1 ? 1 : page;
        var ps = pageSize is < 1 or > 100 ? 15 : pageSize;

        var q = _db.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            q = q.Where(u => u.FullName.ToLower().Contains(term)
                          || u.Email.ToLower().Contains(term)
                          || u.Phone.ToLower().Contains(term));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(u => u.CreatedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .Select(u => new AdminUserDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                IsEmailVerified = u.IsEmailVerified,
                IsPhoneVerified = u.IsPhoneVerified,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(new PagedResultDto<AdminUserDto>
        {
            Items = items,
            TotalCount = total,
            Page = p,
            PageSize = ps
        });
    }

    [HttpPatch("{id:int}/active")]
    public async Task<IActionResult> ToggleUserActive(int id, [FromBody] AdminToggleUserActiveDto dto)
    {
        var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(currentUserIdStr, out var currentUserId) && currentUserId == id)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Action Prohibited",
                Detail = "An administrator cannot modify their own active status.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();

        return Ok(new { message = $"User status updated to {(user.IsActive ? "Active" : "Blocked")}." });
    }
}
