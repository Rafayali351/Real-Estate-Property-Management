namespace RealEstate.Api.DTOs.Agents;

public class AgentDto
{
    public int AgentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string ProfileImgUrl { get; set; } = string.Empty;
}
