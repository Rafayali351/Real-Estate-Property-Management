-- ==============================================================================
-- LUXURY REAL ESTATE & PROPERTY MANAGEMENT SYSTEM
-- COMPLETE DATABASE SCHEMA & SEED DATA FOR MICROSOFT SQL SERVER (SSMS)
-- Target Server: DELL
-- Database: RealEstateDb
-- Currency: PKR (Pakistani Rupee)
-- Country Code: +92
-- ==============================================================================

USE master;
GO

IF DB_ID('RealEstateDb') IS NULL
BEGIN
    CREATE DATABASE RealEstateDb;
END
GO

USE RealEstateDb;
GO

-- ==============================================================================
-- 1. TABLES DEFINITION (Safe Re-run with IF OBJECT_ID checks)
-- ==============================================================================

-- 1.1 USERS TABLE
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        UserId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FullName NVARCHAR(150) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        Phone NVARCHAR(20) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        IsEmailVerified BIT NOT NULL DEFAULT 0,
        IsPhoneVerified BIT NOT NULL DEFAULT 0,
        Role NVARCHAR(20) NOT NULL DEFAULT N'Client',
        IsActive BIT NOT NULL DEFAULT 1,
        FailedLoginCount INT NOT NULL DEFAULT 0,
        LockoutUntil DATETIME2 NULL,
        LastLoginAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Users_Email UNIQUE (Email),
        CONSTRAINT UQ_Users_Phone UNIQUE (Phone)
    );
END
GO

-- 1.2 OTP CODES TABLE
IF OBJECT_ID(N'dbo.OtpCodes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.OtpCodes (
        OtpId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        CodeHash NVARCHAR(128) NOT NULL,
        Channel NVARCHAR(10) NOT NULL, -- 'Email' | 'Sms'
        Purpose NVARCHAR(20) NOT NULL, -- 'Signup' | 'Login' | 'PasswordReset' | 'ChangeContact'
        Destination NVARCHAR(150) NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        AttemptCount INT NOT NULL DEFAULT 0,
        IsUsed BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_OtpCodes_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE
    );
END
GO

-- 1.3 AGENTS TABLE
IF OBJECT_ID(N'dbo.Agents', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Agents (
        AgentId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FullName NVARCHAR(150) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        Phone NVARCHAR(50) NOT NULL,
        Specialization NVARCHAR(100) NOT NULL,
        Bio NVARCHAR(1000) NOT NULL,
        ProfileImgUrl NVARCHAR(500) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 1.4 PROPERTIES TABLE
IF OBJECT_ID(N'dbo.Properties', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Properties (
        PropertyId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        ListingType NVARCHAR(20) NOT NULL, -- 'Sale' | 'Rent'
        Address NVARCHAR(255) NOT NULL,
        City NVARCHAR(100) NOT NULL,
        PropertyType NVARCHAR(50) NOT NULL, -- 'Penthouse' | 'Villa' | 'Mansion' | 'Apartment' | 'Estate'
        Bedrooms INT NOT NULL,
        Bathrooms INT NOT NULL,
        SqFt INT NOT NULL,
        ImageUrl NVARCHAR(500) NOT NULL, -- Primary cover image
        IsFeatured BIT NOT NULL DEFAULT 0,
        Status NVARCHAR(50) NOT NULL DEFAULT N'Available', -- 'Available' | 'Reserved' | 'Sold' | 'Rented'
        AgentId INT NULL,
        IsActive BIT NOT NULL DEFAULT 1, -- Soft delete
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Properties_Agents FOREIGN KEY (AgentId) REFERENCES dbo.Agents(AgentId) ON DELETE SET NULL
    );
END
GO

-- 1.5 PROPERTY IMAGES (GALLERY)
IF OBJECT_ID(N'dbo.PropertyImages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PropertyImages (
        ImageId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PropertyId INT NOT NULL,
        ImageUrl NVARCHAR(500) NOT NULL,
        SortOrder INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_PropertyImages_Properties FOREIGN KEY (PropertyId) REFERENCES dbo.Properties(PropertyId) ON DELETE CASCADE
    );
END
GO

-- 1.6 FAVORITES TABLE
IF OBJECT_ID(N'dbo.Favorites', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Favorites (
        UserId INT NOT NULL,
        PropertyId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_Favorites PRIMARY KEY (UserId, PropertyId),
        CONSTRAINT FK_Favorites_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
        CONSTRAINT FK_Favorites_Properties FOREIGN KEY (PropertyId) REFERENCES dbo.Properties(PropertyId) ON DELETE CASCADE
    );
END
GO

-- 1.7 TOUR BOOKINGS TABLE
IF OBJECT_ID(N'dbo.TourBookings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TourBookings (
        BookingId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        PropertyId INT NOT NULL,
        ClientName NVARCHAR(150) NOT NULL,
        ClientEmail NVARCHAR(150) NOT NULL,
        ClientPhone NVARCHAR(50) NOT NULL,
        PreferredDate DATETIME2 NOT NULL,
        Notes NVARCHAR(MAX) NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT N'Pending', -- 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
        AdminNote NVARCHAR(1000) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_TourBookings_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_TourBookings_Properties FOREIGN KEY (PropertyId) REFERENCES dbo.Properties(PropertyId)
    );
END
GO

-- 1.8 INQUIRIES TABLE
IF OBJECT_ID(N'dbo.Inquiries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Inquiries (
        InquiryId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        Email NVARCHAR(150) NOT NULL,
        Phone NVARCHAR(50) NULL,
        Subject NVARCHAR(200) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        PropertyId INT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT N'New', -- 'New' | 'Read' | 'Replied'
        ReplyMessage NVARCHAR(MAX) NULL,
        RepliedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Inquiries_Properties FOREIGN KEY (PropertyId) REFERENCES dbo.Properties(PropertyId) ON DELETE SET NULL
    );
END
GO

-- 1.9 SITE SETTINGS TABLE (Single row, SettingsId = 1)
IF OBJECT_ID(N'dbo.SiteSettings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SiteSettings (
        SettingsId INT NOT NULL PRIMARY KEY,
        CompanyName NVARCHAR(150) NOT NULL,
        Tagline NVARCHAR(255) NOT NULL,
        ContactEmail NVARCHAR(150) NOT NULL,
        ContactPhone NVARCHAR(50) NOT NULL,
        WhatsAppNumber NVARCHAR(50) NOT NULL,
        Address NVARCHAR(255) NOT NULL,
        FacebookUrl NVARCHAR(300) NULL,
        InstagramUrl NVARCHAR(300) NULL,
        LinkedInUrl NVARCHAR(300) NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- ==============================================================================
-- 2. INDEXES FOR HIGH-PERFORMANCE FILTERING AND SEARCHING
-- ==============================================================================

-- Users
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Users_Role' AND object_id = OBJECT_ID(N'dbo.Users'))
    CREATE NONCLUSTERED INDEX IX_Users_Role ON dbo.Users(Role, IsActive);
GO

-- OtpCodes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_OtpCodes_Lookup' AND object_id = OBJECT_ID(N'dbo.OtpCodes'))
    CREATE NONCLUSTERED INDEX IX_OtpCodes_Lookup ON dbo.OtpCodes(UserId, Purpose, IsUsed, ExpiresAt);
GO

-- Properties
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Properties_Filters' AND object_id = OBJECT_ID(N'dbo.Properties'))
    CREATE NONCLUSTERED INDEX IX_Properties_Filters ON dbo.Properties(IsActive, Status, ListingType, City, PropertyType, Price)
    INCLUDE (Title, Bedrooms, Bathrooms, SqFt, ImageUrl, IsFeatured);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Properties_Agent' AND object_id = OBJECT_ID(N'dbo.Properties'))
    CREATE NONCLUSTERED INDEX IX_Properties_Agent ON dbo.Properties(AgentId);
GO

-- PropertyImages
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_PropertyImages_Property' AND object_id = OBJECT_ID(N'dbo.PropertyImages'))
    CREATE NONCLUSTERED INDEX IX_PropertyImages_Property ON dbo.PropertyImages(PropertyId, SortOrder);
GO

-- TourBookings
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_TourBookings_User' AND object_id = OBJECT_ID(N'dbo.TourBookings'))
    CREATE NONCLUSTERED INDEX IX_TourBookings_User ON dbo.TourBookings(UserId, Status);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_TourBookings_Property' AND object_id = OBJECT_ID(N'dbo.TourBookings'))
    CREATE NONCLUSTERED INDEX IX_TourBookings_Property ON dbo.TourBookings(PropertyId, Status);
GO

-- Inquiries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Inquiries_Status' AND object_id = OBJECT_ID(N'dbo.Inquiries'))
    CREATE NONCLUSTERED INDEX IX_Inquiries_Status ON dbo.Inquiries(Status, CreatedAt);
GO

-- ==============================================================================
-- 3. SEED DATA (Only inserted when tables are empty)
-- ==============================================================================

-- 3.1 AGENTS SEED (4 Realistic Top-Tier Luxury Advisors)
IF NOT EXISTS (SELECT 1 FROM dbo.Agents)
BEGIN
    SET IDENTITY_INSERT dbo.Agents ON;
    INSERT INTO dbo.Agents (AgentId, FullName, Email, Phone, Specialization, Bio, ProfileImgUrl, IsActive, CreatedAt)
    VALUES 
    (1, N'Malik Shahryar Khan', N'shahryar.khan@realestate.com', N'+923005550101', N'Ultra-Luxury Diplomatic Enclaves & Hills Estates', N'With over 16 years dominating the Islamabad Margalla Hills and Sector F-6/F-7 luxury corridor, Malik orchestrates private, off-market portfolio acquisitions for high-net-worth families and corporate dignitaries.', N'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80', 1, SYSUTCDATETIME()),
    (2, N'Ayla Sophia Durrani', N'ayla.durrani@realestate.com', N'+923005550102', N'Contemporary Penthouses & Waterfront Estates', N'Recognized across South Asia for architectural acumen and bespoke contract negotiations. Ayla curates premier skyline residences in Karachi Clifton and DHA Phase 8 with unmatched aesthetic finesse.', N'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', 1, SYSUTCDATETIME()),
    (3, N'Hamza Tariq Farooqi', N'hamza.farooqi@realestate.com', N'+923005550103', N'Heritage Mansions & Golf Course Villas', N'Specializing in Lahore DHA Phase 5, Phase 6 and Raya Golf Resort estates, Hamza brings strategic financial structuring and rigorous asset verification to every prime acquisition.', N'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80', 1, SYSUTCDATETIME()),
    (4, N'Zainab Noor Al-Bukhari', N'zainab.bukhari@realestate.com', N'+923005550104', N'Executive Commercial & Private Retreats', N'Directing cross-border transactions and prime gated retreats in Rawalpindi Bahria Golf City and coastal Gwadar Marine Heights, Zainab delivers world-class confidentiality and white-glove advisory.', N'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80', 1, SYSUTCDATETIME());
    SET IDENTITY_INSERT dbo.Agents OFF;
END
GO

-- 3.2 PROPERTIES SEED (12 Distinct Luxury Estates in PKR)
IF NOT EXISTS (SELECT 1 FROM dbo.Properties)
BEGIN
    SET IDENTITY_INSERT dbo.Properties ON;
    INSERT INTO dbo.Properties 
    (PropertyId, Title, Description, Price, ListingType, Address, City, PropertyType, Bedrooms, Bathrooms, SqFt, ImageUrl, IsFeatured, Status, AgentId, IsActive, CreatedAt, UpdatedAt)
    VALUES
    (1, N'The Margalla Crest Presidential Estate', 
     N'Perched high in the serene foothills of Sector E-7 Islamabad, this trophy estate commands panoramic views of the Margalla National Park. Features imported Italian travertine cladding, double-height grand gallery, temperature-controlled subterranean infinity pool, dedicated guest wing, commercial-grade German kitchen, and bespoke biometric security throughout.',
     385000000.00, N'Sale', N'Plot 14, Hillside Road, Sector E-7', N'Islamabad', N'Mansion', 7, 9, 14500,
     N'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 1, N'Available', 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (2, N'The Horizon Oceanfront Duplex Penthouse', 
     N'Hovering above the Arabian Sea along Clifton Beach Karachi, this dual-level glass sanctuary offers uninterrupted 270-degree sunset panoramas. Boasting a private rooftop helipad access, wraparound sky terrace with heated plunge pool, smart glass automation, Bang & Olufsen acoustic engineering, and 24/7 concierge lifestyle management.',
     245000000.00, N'Sale', N'Tower A, Penthouse 34, Marine Drive, Clifton Block 2', N'Karachi', N'Penthouse', 5, 6, 8800,
     N'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 1, N'Available', 2, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (3, N'The Raya Fairway Sovereign Villa', 
     N'Directly fronting the 18th hole at DHA Raya Golf Resort Lahore, this architectural tour-de-force features minimalist modern lines framed by lush Zen courtyards. Highlights include a 12-seat private cinema, floor-to-ceiling Schuco glass, climate-controlled wine cellar, and outdoor entertainment pavilions with tranquil reflection ponds.',
     195000000.00, N'Sale', N'Boulevard 9, Sector M, DHA Phase 6 / Raya Fairways', N'Lahore', N'Villa', 6, 7, 9500,
     N'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 1, N'Available', 3, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (4, N'The Pine Ridge Modernist Sanctuary', 
     N'A rare architectural triumph nestled amidst ancient pine canopies. Expansive cantilevered cedar decks, floor-to-ceiling glass pavilions, double master suites with heated limestone floors, artisan copper fireplaces, and panoramic mountain vistas. The ultimate weekend retreat or family sanctuary.',
     125000000.00, N'Sale', N'Upper Pine Ridge Trail, Sector F-6/3', N'Islamabad', N'Villa', 5, 6, 7200,
     N'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 1, N'Available', 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (5, N'The Glasshouse Sky Residence', 
     N'Exquisite full-floor residence for lease in Gulberg III. Impeccably furnished with designer European couture pieces, private high-speed elevator opening directly into the foyer, chef kitchen with Gaggenau appliances, bespoke champagne bar, and panoramic city lights vistas.',
     850000.00, N'Rent', N'Floor 18, Royal Heights, Main Boulevard, Gulberg III', N'Lahore', N'Penthouse', 4, 5, 5400,
     N'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80', 0, N'Available', 3, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (6, N'The Grand Canal Italianate Manor', 
     N'Inspired by Palladian elegance along Bahria Golf City, this palatial residence showcases soaring 24-foot vaulted ceilings, hand-carved imported marble fireplaces, a crystal chandelier gallery, landscaped formal French gardens, tennis court, and dedicated staff quarters.',
     175000000.00, N'Sale', N'Avenue 3, Gated Sector A, Bahria Golf City', N'Rawalpindi', N'Mansion', 6, 8, 11000,
     N'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 0, N'Reserved', 4, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (7, N'The Creek Vista Diplomatic Retreat', 
     N'Superb waterfront leasing opportunity in DHA Phase 8 Karachi. High-security diplomatic perimeter, serene water views, private boat mooring, infinity-edge swimming pool overlooking the marina, solar microgrid, and smart climate control throughout.',
     1200000.00, N'Rent', N'Street 12, Waterfront Enclave, DHA Phase 8 Zone A', N'Karachi', N'Villa', 5, 6, 8200,
     N'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', 0, N'Available', 2, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (8, N'The Elysium Modern Minimalist Estate', 
     N'An extraordinary statement of pure geometric architecture in DHA Phase 5. Cast concrete, floating teak staircases, museum-grade art illumination, internal glass courtyards with centuries-old olive trees, and an underground 6-car collector gallery.',
     220000000.00, N'Sale', N'Block H, Main Park Avenue, DHA Phase 5', N'Lahore', N'Villa', 5, 6, 8600,
     N'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', 0, N'Sold', 3, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (9, N'The Diplomatic Quarter Garden Residence', 
     N'Private gated sanctuary located in Islamabad prestigious Diplomatic Enclave zone. Surrounded by high security, embassies, and verdant parklands. Features triple-glazed acoustic windows, whole-house HEPA air purification, private security suite, and heated greenhouse.',
     650000.00, N'Rent', N'Consulate Way, Sector G-5 Diplomatic Zone', N'Islamabad', N'Apartment', 3, 4, 3800,
     N'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 0, N'Rented', 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (10, N'The Marina Pearl Contemporary Villa', 
     N'Pioneering coastal luxury in the burgeoning Gwadar Marine Highlands. Designed by international architects with sustainable passive cooling, desalinated private water filtration, unobstructed sunset terraces over the Gulf of Oman, and private beach frontage.',
     95000000.00, N'Sale', N'Coastal Promenade, Gwadar Marine Heights Sector 1', N'Gwadar', N'Villa', 4, 5, 6100,
     N'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80', 0, N'Available', 4, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (11, N'The Margalla Foothills Designer Penthouse', 
     N'A masterwork of urban luxury situated at The Centaurus Residences. High floor with unobstructed view of the National Monument and Margalla Hills. Private elevator foyer, Italian custom kitchen, bespoke brass fixtures, sauna, and dedicated triple garage parking.',
     115000000.00, N'Sale', N'The Residences Tower 2, Jinnah Avenue, F-8', N'Islamabad', N'Penthouse', 4, 5, 4900,
     N'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 0, N'Available', 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),

    (12, N'The Old Clifton Colonial Heritage Residence', 
     N'A meticulously restored 1920s limestone estate combining historic British-era high arches with cutting-edge 21st-century luxury. Lush quarter-acre private botanical gardens, separate guest carriage cottage, swimming pool pavilion, and unmatched tranquility.',
     280000000.00, N'Sale', N'Old Clifton Heritage Reserve, Near Mohatta Palace', N'Karachi', N'Mansion', 6, 7, 12000,
     N'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80', 0, N'Available', 2, 1, SYSUTCDATETIME(), SYSUTCDATETIME());

    SET IDENTITY_INSERT dbo.Properties OFF;
END
GO

-- 3.3 PROPERTY IMAGES SEED (3 Gallery images for each of the 12 properties = 36 curated photos)
IF NOT EXISTS (SELECT 1 FROM dbo.PropertyImages)
BEGIN
    INSERT INTO dbo.PropertyImages (PropertyId, ImageUrl, SortOrder, CreatedAt)
    VALUES
    -- Property 1 (Margalla Crest Presidential)
    (1, N'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (1, N'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (1, N'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 2 (Horizon Oceanfront Penthouse)
    (2, N'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (2, N'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (2, N'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 3 (Raya Fairway Sovereign Villa)
    (3, N'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (3, N'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (3, N'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 4 (Pine Ridge Modernist Sanctuary)
    (4, N'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (4, N'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (4, N'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 5 (Glasshouse Sky Residence)
    (5, N'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (5, N'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (5, N'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 6 (Grand Canal Italianate Manor)
    (6, N'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (6, N'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (6, N'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 7 (Creek Vista Diplomatic Retreat)
    (7, N'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (7, N'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (7, N'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 8 (Elysium Modern Minimalist Estate)
    (8, N'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (8, N'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (8, N'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 9 (Diplomatic Quarter Garden Residence)
    (9, N'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (9, N'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (9, N'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 10 (Marina Pearl Contemporary Villa)
    (10, N'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (10, N'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (10, N'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 11 (Margalla Foothills Designer Penthouse)
    (11, N'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (11, N'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (11, N'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME()),

    -- Property 12 (Old Clifton Colonial Heritage Residence)
    (12, N'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80', 1, SYSUTCDATETIME()),
    (12, N'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80', 2, SYSUTCDATETIME()),
    (12, N'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', 3, SYSUTCDATETIME());
END
GO

-- 3.4 SITE SETTINGS SEED (Single Row, SettingsId = 1)
IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE SettingsId = 1)
BEGIN
    INSERT INTO dbo.SiteSettings 
    (SettingsId, CompanyName, Tagline, ContactEmail, ContactPhone, WhatsAppNumber, Address, FacebookUrl, InstagramUrl, LinkedInUrl, UpdatedAt)
    VALUES 
    (1, 
     N'REAL ESTATE', 
     N'Exquisite Living, Elevated Architecture & Bespoke Real Estate Management',
     N'concierge@realestate.com', 
     N'+92518899000', 
     N'+923005550100', 
     N'Level 24, Presidential Tower, Blue Area, Islamabad, Pakistan',
     N'https://facebook.com/realestateluxury', 
     N'https://instagram.com/realestateluxury', 
     N'https://linkedin.com/company/realestateluxury', 
     SYSUTCDATETIME());
END
GO

-- ==============================================================================
-- 4. VERIFICATION SUMMARY
-- ==============================================================================
SELECT 'Agents Count' AS Metric, COUNT(*) AS TotalCount FROM dbo.Agents
UNION ALL
SELECT 'Properties Count' AS Metric, COUNT(*) AS TotalCount FROM dbo.Properties
UNION ALL
SELECT 'Property Gallery Images' AS Metric, COUNT(*) AS TotalCount FROM dbo.PropertyImages
UNION ALL
SELECT 'Site Settings Rows' AS Metric, COUNT(*) AS TotalCount FROM dbo.SiteSettings;
GO
