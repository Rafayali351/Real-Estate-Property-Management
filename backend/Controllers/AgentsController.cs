using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.DTOs.Agents;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AgentsController(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Retrieve all active luxury estate advisors.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<AgentDto>>> GetAgents()
    {
        var agents = await _db.Agents
            .AsNoTracking()
            .Where(a => a.IsActive)
            .OrderBy(a => a.FullName)
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
}
