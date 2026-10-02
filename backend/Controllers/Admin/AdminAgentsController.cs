using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Admin;
using RealEstate.Api.DTOs.Agents;
using RealEstate.Api.Models;

namespace RealEstate.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/agents")]
public class AdminAgentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminAgentsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AgentDto>>> GetAllAgents()
    {
        var agents = await _db.Agents
            .AsNoTracking()
            .OrderByDescending(a => a.IsActive)
            .ThenBy(a => a.FullName)
            .Select(a => new AgentDto
            {
                AgentId = a.AgentId,
                FullName = a.FullName,
                Email = a.Email,
                Phone = a.Phone,
                Specialization = a.Specialization,
                Bio = a.Bio,
                ProfileImgUrl = a.ProfileImgUrl
            })
            .ToListAsync();

        return Ok(agents);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAgent([FromBody] AdminAgentCreateUpdateDto dto)
    {
        var agent = new Agent
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Phone = dto.Phone.Trim(),
            Specialization = dto.Specialization.Trim(),
            Bio = dto.Bio.Trim(),
            ProfileImgUrl = dto.ProfileImgUrl.Trim(),
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.Agents.Add(agent);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Advisor created successfully.", agentId = agent.AgentId });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAgent(int id, [FromBody] AdminAgentCreateUpdateDto dto)
    {
        var agent = await _db.Agents.FindAsync(id);
        if (agent == null) return NotFound();

        agent.FullName = dto.FullName.Trim();
        agent.Email = dto.Email.Trim().ToLowerInvariant();
        agent.Phone = dto.Phone.Trim();
        agent.Specialization = dto.Specialization.Trim();
        agent.Bio = dto.Bio.Trim();
        agent.ProfileImgUrl = dto.ProfileImgUrl.Trim();
        agent.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Advisor updated successfully." });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeactivateAgent(int id)
    {
        var agent = await _db.Agents.FindAsync(id);
        if (agent == null) return NotFound();

        agent.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Advisor deactivated successfully." });
    }
}
