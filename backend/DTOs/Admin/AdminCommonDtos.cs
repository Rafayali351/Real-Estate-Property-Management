using System.ComponentModel.DataAnnotations;

namespace RealEstate.Api.DTOs.Admin;

public class AdminAgentCreateUpdateDto
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Specialization { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Bio { get; set; } = string.Empty;

    [MaxLength(500)]
    public string ProfileImgUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}

public class AdminUpdateTourStatusDto
{
    [Required]
    public string Status { get; set; } = "Confirmed"; // "Pending" | "Confirmed" | "Completed" | "Cancelled"

    [MaxLength(1000)]
    public string? AdminNote { get; set; }
}

public class AdminUpdateInquiryStatusDto
{
    [Required]
    public string Status { get; set; } = "Read"; // "New" | "Read" | "Replied"
}

public class AdminReplyInquiryDto
{
    [Required]
    public string Message { get; set; } = string.Empty;
}

public class AdminUserDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = "Client";
    public bool IsEmailVerified { get; set; }
    public bool IsPhoneVerified { get; set; }
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminToggleUserActiveDto
{
    public bool IsActive { get; set; }
}

public class AdminUpdateSettingsDto
{
    [Required]
    [MaxLength(150)]
    public string CompanyName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Tagline { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string ContactEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ContactPhone { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string WhatsAppNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? FacebookUrl { get; set; }

    [MaxLength(300)]
    public string? InstagramUrl { get; set; }

    [MaxLength(300)]
    public string? LinkedInUrl { get; set; }
}
