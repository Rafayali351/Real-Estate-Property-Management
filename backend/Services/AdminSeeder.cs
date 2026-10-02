using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RealEstate.Api.Common;
using RealEstate.Api.Data;
using RealEstate.Api.Models;
using RealEstate.Api.Settings;
using Serilog;

namespace RealEstate.Api.Services;

public static class AdminSeeder
{
    public static async Task SeedInitialAdminAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var adminSeedOptions = scope.ServiceProvider.GetRequiredService<IOptions<AdminSeedSettings>>().Value;

        if (!adminSeedOptions.IsConfigured)
        {
            Log.Information("AdminSeed configuration is incomplete or omitted; skipping default admin seeding.");
            return;
        }

        try
        {
            // Verify if any Admin exists in the database
            var hasAdmin = await db.Users.AnyAsync(u => u.Role == "Admin");
            if (hasAdmin)
            {
                return;
            }

            var normalizedPhone = PhoneNumberNormalizer.Normalize(adminSeedOptions.Phone);

            // Hash password using BCrypt with work factor 12
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(adminSeedOptions.Password, 12);

            var adminUser = new User
            {
                FullName = adminSeedOptions.FullName,
                Email = adminSeedOptions.Email.Trim().ToLowerInvariant(),
                Phone = normalizedPhone,
                PasswordHash = passwordHash,
                Role = "Admin",
                IsEmailVerified = true,
                IsPhoneVerified = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(adminUser);
            await db.SaveChangesAsync();

            Log.Information("Initial System Administrator successfully provisioned: Email: {Email}, Phone: {MaskedPhone}", 
                adminUser.Email, StringMasker.MaskPhone(normalizedPhone));
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to provision initial administrator account during database startup.");
        }
    }
}
