using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RealEstate.Api.Common;
using RealEstate.Api.Data;
using RealEstate.Api.Services;
using RealEstate.Api.Settings;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// ==============================================================================
// 1. SERILOG STRUCTURED LOGGING CONFIGURATION
// ==============================================================================
var logDirectory = Path.Combine(builder.Environment.ContentRootPath, "logs");
if (!Directory.Exists(logDirectory))
{
    Directory.CreateDirectory(logDirectory);
}

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        path: Path.Combine(logDirectory, "app-.log"),
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] ({SourceContext}) {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

Log.Information("Starting Luxury Real Estate Management API Engine...");

// ==============================================================================
// 2. STRONGLY TYPED SETTINGS & VALIDATION
// ==============================================================================
builder.Services.AddOptions<JwtSettings>()
    .Bind(builder.Configuration.GetSection(JwtSettings.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOptions<OtpSettings>()
    .Bind(builder.Configuration.GetSection(OtpSettings.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection(SmtpSettings.SectionName));
builder.Services.Configure<TwilioSettings>(builder.Configuration.GetSection(TwilioSettings.SectionName));
builder.Services.Configure<AdminSeedSettings>(builder.Configuration.GetSection(AdminSeedSettings.SectionName));
builder.Services.Configure<CorsSettings>(builder.Configuration.GetSection(CorsSettings.SectionName));
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection(AppSettings.SectionName));

// ==============================================================================
// 3. DATABASE CONFIGURATION (EF CORE SQL SERVER)
// ==============================================================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Log.Warning("ConnectionStrings:DefaultConnection is empty or not configured. Using development fallback.");
    connectionString = "Server=DELL;Database=RealEstateDb;Trusted_Connection=True;TrustServerCertificate=True;";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    });
});

// ==============================================================================
// 4. DEPENDENCY INJECTION: SERVICES
// ==============================================================================
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<ISmsSender, TwilioSmsSender>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// ==============================================================================
// 5. JWT BEARER AUTHENTICATION (READS FROM HTTPONLY COOKIE "re_auth")
// ==============================================================================
var jwtSecret = builder.Configuration["Jwt:Secret"] 
    ?? "RealEstateLuxurySuperSecretKeyForJwtTokenAuth2026_MustBeLongEnough!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RealEstateApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RealEstateClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30)
    };

    // Extract token from HttpOnly cookie "re_auth" or Authorization Bearer header
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue("re_auth", out var cookieToken) && !string.IsNullOrWhiteSpace(cookieToken))
            {
                context.Token = cookieToken;
            }
            else
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    context.Token = authHeader["Bearer ".Length..].Trim();
                }
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ==============================================================================
// 6. ASP.NET RATE LIMITING CONFIGURATION
// ==============================================================================
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("AuthLimiter", opt =>
    {
        opt.PermitLimit = 15;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 2;
    });
    options.AddFixedWindowLimiter("InquiryLimiter", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});

// ==============================================================================
// 7. CORS POLICY CONFIGURATION
// ==============================================================================
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? ["http://localhost:3000", "http://127.0.0.1:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("RealEstateCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ==============================================================================
// 8. CONTROLLER & JSON SERIALIZATION
// ==============================================================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(er => er.ErrorMessage).ToArray()
            );

        var problemDetails = new ValidationProblemDetails(errors)
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Detail = "Please refer to the errors property for additional details.",
            Instance = context.HttpContext.Request.Path
        };

        return new BadRequestObjectResult(problemDetails)
        {
            ContentTypes = { "application/problem+json" }
        };
    };
});

// ==============================================================================
// 9. SWAGGER / OPENAPI CONFIGURATION
// ==============================================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "REAL ESTATE LUXURY API",
        Version = "v1",
        Description = "Enterprise Luxury Real Estate Management API Engine targeting SSMS RealEstateDb."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization via 're_auth' cookie or 'Bearer {token}' header.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ==============================================================================
// 10. GLOBAL EXCEPTION HANDLER (RFC 7807 ProblemDetails)
// ==============================================================================
app.UseExceptionHandler(exceptionApp =>
{
    exceptionApp.Run(async context =>
    {
        context.Response.ContentType = "application/problem+json";
        var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        var statusCode = StatusCodes.Status500InternalServerError;
        var title = "An unexpected error occurred processing your request.";
        var detail = app.Environment.IsDevelopment() 
            ? exception?.Message 
            : "A server error occurred. Please contact concierge support if the issue persists.";

        if (exception is ServiceUnavailableException)
        {
            statusCode = StatusCodes.Status503ServiceUnavailable;
            title = "External Service Unavailable";
            detail = exception.Message;
        }
        else if (exception is InvalidOperationException)
        {
            statusCode = StatusCodes.Status400BadRequest;
            title = "Invalid Operation";
        }
        else if (exception is KeyNotFoundException)
        {
            statusCode = StatusCodes.Status404NotFound;
            title = "Resource Not Found";
        }

        Log.Error(exception, "Unhandled exception: {ErrorMessage}", exception?.Message);

        context.Response.StatusCode = statusCode;

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path,
            Type = $"https://httpstatuses.com/{statusCode}"
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    });
});

// ==============================================================================
// 11. SECURITY HEADERS & PIPELINE
// ==============================================================================
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "REAL ESTATE API V1");
        c.RoutePrefix = "swagger";
    });
}

// Serve static uploads
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
app.UseStaticFiles();

app.UseCors("RealEstateCorsPolicy");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Apply Rate Limiting to Auth Endpoints
app.MapGroup("/api/auth").RequireRateLimiting("AuthLimiter");

// ==============================================================================
// 12. HEALTH CHECK ENDPOINT
// ==============================================================================
app.MapGet("/health", async ([FromServices] ApplicationDbContext db) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        if (canConnect)
        {
            return Results.Ok(new
            {
                status = "Healthy",
                database = "Connected",
                timestamp = DateTime.UtcNow,
                brand = "REAL ESTATE"
            });
        }

        return Results.Json(new
        {
            status = "Degraded",
            database = "Cannot Connect to SQL Server",
            timestamp = DateTime.UtcNow
        }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Health check failed to communicate with Database.");
        return Results.Json(new
        {
            status = "Unhealthy",
            error = ex.Message,
            timestamp = DateTime.UtcNow
        }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});

app.MapControllers();

// ==============================================================================
// 13. SEED INITIAL SYSTEM ADMINISTRATOR (IF CONFIGURED & NOT PRESENT)
// ==============================================================================
await AdminSeeder.SeedInitialAdminAsync(app.Services);

app.Run();
