using System.ComponentModel.DataAnnotations;

namespace RealEstate.Api.DTOs.Tours;

public class BookTourRequestDto
{
    [Required]
    public int PropertyId { get; set; }

    [Required]
    public DateTime PreferredDate { get; set; }

    [MaxLength(150)]
    public string? ClientName { get; set; }

    [EmailAddress]
    [MaxLength(150)]
    public string? ClientEmail { get; set; }

    [MaxLength(50)]
    public string? ClientPhone { get; set; }

    public string? Notes { get; set; }
}
