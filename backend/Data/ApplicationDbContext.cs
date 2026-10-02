using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Models;

namespace RealEstate.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<OtpCode> OtpCodes => Set<OtpCode>();
    public DbSet<Agent> Agents => Set<Agent>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<TourBooking> TourBookings => Set<TourBooking>();
    public DbSet<Inquiry> Inquiries => Set<Inquiry>();
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Users Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(u => u.UserId);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Phone).IsUnique();
            entity.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
            entity.Property(u => u.Phone).HasMaxLength(20).IsRequired();
            entity.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(u => u.Role).HasMaxLength(20).HasDefaultValue("Client");
            entity.Property(u => u.IsActive).HasDefaultValue(true);
            entity.Property(u => u.IsEmailVerified).HasDefaultValue(false);
            entity.Property(u => u.IsPhoneVerified).HasDefaultValue(false);
            entity.Property(u => u.FailedLoginCount).HasDefaultValue(0);
            entity.Property(u => u.CreatedAt).HasColumnType("datetime2");
            entity.Property(u => u.LockoutUntil).HasColumnType("datetime2");
            entity.Property(u => u.LastLoginAt).HasColumnType("datetime2");
        });

        // 2. OtpCodes Configuration
        modelBuilder.Entity<OtpCode>(entity =>
        {
            entity.ToTable("OtpCodes");
            entity.HasKey(o => o.OtpId);
            entity.Property(o => o.CodeHash).HasMaxLength(128).IsRequired();
            entity.Property(o => o.Channel).HasMaxLength(10).IsRequired();
            entity.Property(o => o.Purpose).HasMaxLength(20).IsRequired();
            entity.Property(o => o.Destination).HasMaxLength(150).IsRequired();
            entity.Property(o => o.ExpiresAt).HasColumnType("datetime2");
            entity.Property(o => o.CreatedAt).HasColumnType("datetime2");
            entity.Property(o => o.AttemptCount).HasDefaultValue(0);
            entity.Property(o => o.IsUsed).HasDefaultValue(false);

            entity.HasOne(o => o.User)
                  .WithMany(u => u.OtpCodes)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 3. Agents Configuration
        modelBuilder.Entity<Agent>(entity =>
        {
            entity.ToTable("Agents");
            entity.HasKey(a => a.AgentId);
            entity.Property(a => a.FullName).HasMaxLength(150).IsRequired();
            entity.Property(a => a.Email).HasMaxLength(150).IsRequired();
            entity.Property(a => a.Phone).HasMaxLength(50).IsRequired();
            entity.Property(a => a.Specialization).HasMaxLength(100).IsRequired();
            entity.Property(a => a.Bio).HasMaxLength(1000);
            entity.Property(a => a.ProfileImgUrl).HasMaxLength(500);
            entity.Property(a => a.IsActive).HasDefaultValue(true);
            entity.Property(a => a.CreatedAt).HasColumnType("datetime2");
        });

        // 4. Properties Configuration
        modelBuilder.Entity<Property>(entity =>
        {
            entity.ToTable("Properties");
            entity.HasKey(p => p.PropertyId);
            entity.Property(p => p.Title).HasMaxLength(255).IsRequired();
            entity.Property(p => p.Description).IsRequired();
            entity.Property(p => p.Price).HasPrecision(18, 2);
            entity.Property(p => p.ListingType).HasMaxLength(20).IsRequired();
            entity.Property(p => p.Address).HasMaxLength(255).IsRequired();
            entity.Property(p => p.City).HasMaxLength(100).IsRequired();
            entity.Property(p => p.PropertyType).HasMaxLength(50).IsRequired();
            entity.Property(p => p.ImageUrl).HasMaxLength(500);
            entity.Property(p => p.Status).HasMaxLength(50).HasDefaultValue("Available");
            entity.Property(p => p.IsFeatured).HasDefaultValue(false);
            entity.Property(p => p.IsActive).HasDefaultValue(true);
            entity.Property(p => p.CreatedAt).HasColumnType("datetime2");
            entity.Property(p => p.UpdatedAt).HasColumnType("datetime2");

            entity.HasOne(p => p.Agent)
                  .WithMany(a => a.Properties)
                  .HasForeignKey(p => p.AgentId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // 5. PropertyImages Configuration
        modelBuilder.Entity<PropertyImage>(entity =>
        {
            entity.ToTable("PropertyImages");
            entity.HasKey(pi => pi.ImageId);
            entity.Property(pi => pi.ImageUrl).HasMaxLength(500).IsRequired();
            entity.Property(pi => pi.SortOrder).HasDefaultValue(0);
            entity.Property(pi => pi.CreatedAt).HasColumnType("datetime2");

            entity.HasOne(pi => pi.Property)
                  .WithMany(p => p.Images)
                  .HasForeignKey(pi => pi.PropertyId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 6. Favorites Configuration (Composite Key)
        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.ToTable("Favorites");
            entity.HasKey(f => new { f.UserId, f.PropertyId });
            entity.Property(f => f.CreatedAt).HasColumnType("datetime2");

            entity.HasOne(f => f.User)
                  .WithMany(u => u.Favorites)
                  .HasForeignKey(f => f.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.Property)
                  .WithMany(p => p.Favorites)
                  .HasForeignKey(f => f.PropertyId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 7. TourBookings Configuration
        modelBuilder.Entity<TourBooking>(entity =>
        {
            entity.ToTable("TourBookings");
            entity.HasKey(tb => tb.BookingId);
            entity.Property(tb => tb.ClientName).HasMaxLength(150).IsRequired();
            entity.Property(tb => tb.ClientEmail).HasMaxLength(150).IsRequired();
            entity.Property(tb => tb.ClientPhone).HasMaxLength(50).IsRequired();
            entity.Property(tb => tb.Status).HasMaxLength(50).HasDefaultValue("Pending");
            entity.Property(tb => tb.AdminNote).HasMaxLength(1000);
            entity.Property(tb => tb.PreferredDate).HasColumnType("datetime2");
            entity.Property(tb => tb.CreatedAt).HasColumnType("datetime2");
            entity.Property(tb => tb.UpdatedAt).HasColumnType("datetime2");

            entity.HasOne(tb => tb.User)
                  .WithMany(u => u.TourBookings)
                  .HasForeignKey(tb => tb.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tb => tb.Property)
                  .WithMany(p => p.TourBookings)
                  .HasForeignKey(tb => tb.PropertyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 8. Inquiries Configuration
        modelBuilder.Entity<Inquiry>(entity =>
        {
            entity.ToTable("Inquiries");
            entity.HasKey(i => i.InquiryId);
            entity.Property(i => i.Name).HasMaxLength(150).IsRequired();
            entity.Property(i => i.Email).HasMaxLength(150).IsRequired();
            entity.Property(i => i.Phone).HasMaxLength(50);
            entity.Property(i => i.Subject).HasMaxLength(200).IsRequired();
            entity.Property(i => i.Message).IsRequired();
            entity.Property(i => i.Status).HasMaxLength(20).HasDefaultValue("New");
            entity.Property(i => i.CreatedAt).HasColumnType("datetime2");
            entity.Property(i => i.RepliedAt).HasColumnType("datetime2");

            entity.HasOne(i => i.Property)
                  .WithMany(p => p.Inquiries)
                  .HasForeignKey(i => i.PropertyId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // 9. SiteSettings Configuration
        modelBuilder.Entity<SiteSetting>(entity =>
        {
            entity.ToTable("SiteSettings");
            entity.HasKey(s => s.SettingsId);
            entity.Property(s => s.SettingsId).ValueGeneratedNever();
            entity.Property(s => s.CompanyName).HasMaxLength(150).IsRequired();
            entity.Property(s => s.Tagline).HasMaxLength(255).IsRequired();
            entity.Property(s => s.ContactEmail).HasMaxLength(150).IsRequired();
            entity.Property(s => s.ContactPhone).HasMaxLength(50).IsRequired();
            entity.Property(s => s.WhatsAppNumber).HasMaxLength(50).IsRequired();
            entity.Property(s => s.Address).HasMaxLength(255).IsRequired();
            entity.Property(s => s.FacebookUrl).HasMaxLength(300);
            entity.Property(s => s.InstagramUrl).HasMaxLength(300);
            entity.Property(s => s.LinkedInUrl).HasMaxLength(300);
            entity.Property(s => s.UpdatedAt).HasColumnType("datetime2");
        });
    }
}
