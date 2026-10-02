using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Admin;
using RealEstate.Api.DTOs.Common;
using RealEstate.Api.Services;

namespace RealEstate.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/inquiries")]
public class AdminInquiriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notificationService;

    public AdminInquiriesController(ApplicationDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<InquiryItemDto>>> GetInquiries(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var p = page < 1 ? 1 : page;
        var ps = pageSize is < 1 or > 100 ? 15 : pageSize;

        var q = _db.Inquiries
            .AsNoTracking()
            .Include(i => i.Property)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var st = status.Trim().ToLower();
            q = q.Where(i => i.Status.ToLower() == st);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            q = q.Where(i => i.Name.ToLower().Contains(term)
                          || i.Email.ToLower().Contains(term)
                          || i.Subject.ToLower().Contains(term)
                          || i.Message.ToLower().Contains(term));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(i => i.CreatedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .Select(i => new InquiryItemDto
            {
                InquiryId = i.InquiryId,
                Name = i.Name,
                Email = i.Email,
                Phone = i.Phone,
                Subject = i.Subject,
                Message = i.Message,
                PropertyId = i.PropertyId,
                PropertyTitle = i.Property != null ? i.Property.Title : null,
                Status = i.Status,
                ReplyMessage = i.ReplyMessage,
                RepliedAt = i.RepliedAt,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return Ok(new PagedResultDto<InquiryItemDto>
        {
            Items = items,
            TotalCount = total,
            Page = p,
            PageSize = ps
        });
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateInquiryStatus(int id, [FromBody] AdminUpdateInquiryStatusDto dto)
    {
        var inquiry = await _db.Inquiries.FindAsync(id);
        if (inquiry == null) return NotFound();

        inquiry.Status = dto.Status.Trim();
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Inquiry status updated to {inquiry.Status}." });
    }

    [HttpPost("{id:int}/reply")]
    public async Task<IActionResult> ReplyInquiry(int id, [FromBody] AdminReplyInquiryDto dto)
    {
        var inquiry = await _db.Inquiries.FindAsync(id);
        if (inquiry == null) return NotFound();

        inquiry.ReplyMessage = dto.Message.Trim();
        inquiry.RepliedAt = DateTime.UtcNow;
        inquiry.Status = "Replied";

        await _db.SaveChangesAsync();

        _ = Task.Run(async () =>
        {
            await _notificationService.SendInquiryReplyAsync(inquiry, inquiry.ReplyMessage);
        });

        return Ok(new { message = "Reply dispatched to client successfully." });
    }
}
