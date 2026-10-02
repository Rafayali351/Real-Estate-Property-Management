using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RealEstate.Api.Settings;

namespace RealEstate.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/uploads")]
public class AdminUploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly AppSettings _appSettings;
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    public AdminUploadsController(IWebHostEnvironment env, IOptions<AppSettings> appSettings)
    {
        _env = env;
        _appSettings = appSettings.Value;
    }

    [HttpPost]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] string folder = "properties")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "No File Uploaded",
                Detail = "Please provide a valid image file.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "File Too Large",
                Detail = "The maximum allowed image file size is 5 MB.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Validate folder: must be "properties" or "agents"
        var normalizedFolder = folder.ToLowerInvariant() switch
        {
            "agents" => "agents",
            _ => "properties"
        };

        // Validate Magic Bytes
        using var stream = file.OpenReadStream();
        var headerBytes = new byte[12];
        var bytesRead = await stream.ReadAsync(headerBytes, 0, 12);
        if (bytesRead < 12)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid File Content",
                Detail = "The uploaded file could not be read or is invalid.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        string extension;
        if (headerBytes[0] == 0xFF && headerBytes[1] == 0xD8 && headerBytes[2] == 0xFF)
        {
            extension = ".jpg";
        }
        else if (headerBytes[0] == 0x89 && headerBytes[1] == 0x50 && headerBytes[2] == 0x4E && headerBytes[3] == 0x47 &&
                 headerBytes[4] == 0x0D && headerBytes[5] == 0x0A && headerBytes[6] == 0x1A && headerBytes[7] == 0x0A)
        {
            extension = ".png";
        }
        else if (headerBytes[0] == 0x52 && headerBytes[1] == 0x49 && headerBytes[2] == 0x46 && headerBytes[3] == 0x46 && // RIFF
                 headerBytes[8] == 0x57 && headerBytes[9] == 0x45 && headerBytes[10] == 0x42 && headerBytes[11] == 0x50) // WEBP
        {
            extension = ".webp";
        }
        else
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Unsupported File Type",
                Detail = "Only genuine JPG, PNG, and WEBP images are supported.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Generate GUID filename
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", normalizedFolder);
        if (!Directory.Exists(uploadsDir))
        {
            Directory.CreateDirectory(uploadsDir);
        }

        var fullPath = Path.Combine(uploadsDir, fileName);
        stream.Seek(0, SeekOrigin.Begin);
        using (var outputStream = new FileStream(fullPath, FileMode.Create))
        {
            await stream.CopyToAsync(outputStream);
        }

        var relativePath = $"/uploads/{normalizedFolder}/{fileName}";
        var publicUrl = !string.IsNullOrWhiteSpace(_appSettings.PublicApiUrl)
            ? $"{_appSettings.PublicApiUrl.TrimEnd('/')}{relativePath}"
            : relativePath;

        return Ok(new
        {
            url = publicUrl,
            relativePath = relativePath,
            fileName = fileName,
            size = file.Length
        });
    }
}
