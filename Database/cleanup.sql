-- ==============================================================================
-- LUXURY REAL ESTATE PLATFORM — DATABASE CLEANUP & RESET SCRIPT
-- Target Database: RealEstateDb
-- Server: DELL (or localhost)
-- Description: Cleans transactional/test data and resets auto-increment IDs to 1.
-- ==============================================================================

USE RealEstateDb;
GO

-- ==============================================================================
-- 1. DELETE ALL DATA (Order matters due to Foreign Key constraints)
-- ==============================================================================

-- Step 1.1: Delete Dependent Child Records First
DELETE FROM dbo.Favorites;
DELETE FROM dbo.TourBookings;
DELETE FROM dbo.Inquiries;
DELETE FROM dbo.OtpCodes;
DELETE FROM dbo.PropertyImages;

-- Step 1.2: Delete Properties & Agents
DELETE FROM dbo.Properties;
DELETE FROM dbo.Agents;

-- Step 1.3: Delete Client Users (Keeps Super Admin intact so you can login to /admin)
DELETE FROM dbo.Users WHERE Role <> 'Admin';

-- Note: If you want to delete ALL users including Admin, uncomment the line below:
-- DELETE FROM dbo.Users;

GO

-- ==============================================================================
-- 2. RESEED AUTO-INCREMENT IDENTITY COUNTERS (So next inserted ID starts at 1)
-- ==============================================================================

DBCC CHECKIDENT ('dbo.Favorites', RESEED, 0);
DBCC CHECKIDENT ('dbo.TourBookings', RESEED, 0);
DBCC CHECKIDENT ('dbo.Inquiries', RESEED, 0);
DBCC CHECKIDENT ('dbo.OtpCodes', RESEED, 0);
DBCC CHECKIDENT ('dbo.PropertyImages', RESEED, 0);
DBCC CHECKIDENT ('dbo.Properties', RESEED, 0);
DBCC CHECKIDENT ('dbo.Agents', RESEED, 0);

-- If you wiped all users above, you can reseed Users identity as well:
-- DBCC CHECKIDENT ('dbo.Users', RESEED, 0);

GO

-- ==============================================================================
-- 3. VERIFY TABLE ROW COUNTS
-- ==============================================================================

SELECT 
    t.name AS TableName, 
    p.rows AS TotalRows
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0, 1)
ORDER BY TableName;
GO
