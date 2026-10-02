# REAL ESTATE | Enterprise Luxury Property Platform

An enterprise-grade luxury real estate management and client acquisition system built with **Next.js 14 (App Router)**, **Tailwind CSS**, **GSAP 3**, and an **ASP.NET Core 8 Web API** backed by **Microsoft SQL Server (SSMS)**.

Designed specifically for premium Pakistani luxury real estate markets (Islamabad, Lahore, Karachi, Rawalpindi, Peshawar, Multan, Gwadar) with native currency formatting (`PKR`), real multi-channel OTP authentication, client portal, and an executive administration dashboard.

---

## 🏛 System Architecture Overview

The system is organized into three interconnected operational layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          1. PUBLIC WEBSITE                              │
│  - Luxury Dark Obsidian Theme (#121212, #1A1A1A, Champagne Gold #D4AF37) │
│  - GSAP 3 Custom Inertia Cursor & Micro-Interactions                    │
│  - Real-Time Search & Multi-Criteria Filtration (Buy/Rent/Plot)         │
│  - Dynamic Property Showcase & Interactive Photo Gallery                │
│  - VIP Private Tour Booking & Concierge Inquiry Transmission            │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
┌───────────────────▼─────────────┐     ┌─────────────▼───────────────────┐
│         2. CLIENT PORTAL        │     │         3. ADMIN PANEL          │
│  - Real 2-Step OTP Auth         │     │  - Executive KPI Analytics      │
│    (Email SMTP / Twilio SMS)    │     │  - Property Catalog & Media     │
│  - Saved Favorite Estates       │     │  - Tour Appointment Processing  │
│  - Scheduled VIP Tour Bookings  │     │  - Inquiry Inbox & Email Reply  │
│  - Profile & OTP-Guarded Phone/ │     │  - Client Directory & Ban Guard │
│    Email Address Verification   │     │  - Global Site Settings Editor  │
└───────────────────┬─────────────┘     └─────────────┬───────────────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     │ RESTful JSON API + JWT Cookie
┌────────────────────────────────────▼────────────────────────────────────┐
│                    4. ASP.NET CORE 8 WEB API (BACKEND)                  │
│  - Controllers: Auth, Properties, Agents, Inquiries, Tours, Admin...    │
│  - Services: OtpService (HMAC-SHA256), SmtpEmailSender, TwilioSmsSender │
│  - Security: HttpOnly SameSite=Lax Cookie Auth, Role-Based Access       │
│  - File Uploads: Magic-Byte Signature Validation (JPEG, PNG, WEBP)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Entity Framework Core 8
┌────────────────────────────────────▼────────────────────────────────────┐
│                  5. MICROSOFT SQL SERVER (RealEstateDb)                 │
│  - Tables: Users, Roles, Properties, PropertyImages, Agents,            │
│            TourBookings, Inquiries, Favorites, OtpTokens, SiteSettings │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **.NET 8.0 SDK** (or .NET 9.0 SDK) installed (`dotnet --version`)
- **Node.js 18+** & **npm** installed (`node -v`)
- **Microsoft SQL Server** (local instance or SSMS)

---

### Step 1: Initialize Database in SSMS
1. Open **Microsoft SQL Server Management Studio (SSMS)**.
2. Connect to your SQL Server instance (e.g. `DELL` or `localhost`).
3. Open [`Database/schema.sql`](file:///d:/Real%20Estate%20&%20Property%20Management/Database/schema.sql) and execute (**F5**).
4. This creates `RealEstateDb`, the 9 relational tables, indexes, and seeds initial luxury properties, advisors, site settings, and the default administrator account.

---

### Step 2: Configure & Launch Backend API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Verify or update connection string in [`backend/appsettings.Development.json`](file:///d:/Real%20Estate%20&%20Property%20Management/backend/appsettings.Development.json):
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=DELL;Database=RealEstateDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
   }
   ```
3. *(Optional)* Configure real SMTP and Twilio credentials for email/SMS dispatch:
   ```json
   "Email": {
     "Host": "smtp.gmail.com",
     "Port": 587,
     "SenderEmail": "your-email@gmail.com",
     "SenderPassword": "your-16-char-app-password",
     "EnableSsl": true
   },
   "Twilio": {
     "AccountSid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     "AuthToken": "your_twilio_auth_token",
     "FromNumber": "+1234567890"
   }
   ```
   > **Note on OTP fallback:** If SMTP or Twilio are not yet populated, the system securely logs generated OTPs directly to the backend terminal console for immediate development testing without interruption.

4. Run the API:
   ```bash
   dotnet run --launch-profile http
   ```
   - API runs at: `http://localhost:5000`
   - Swagger Documentation: `http://localhost:5000/swagger`

---

### Step 3: Configure & Launch Next.js Frontend

1. From the project root, ensure dependencies are installed:
   ```bash
   npm install
   ```
2. Confirm [`/.env.local`](file:///d:/Real%20Estate%20&%20Property%20Management/.env.local) has the backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_DEFAULT_COUNTRY_CODE=+92
   NEXT_PUBLIC_CURRENCY=PKR
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   - Application runs at: `http://localhost:3000`

---

## 🔐 Default Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@realestate.com` | `Admin@Password123!` | Full Control (`/admin`) |
| **New Client** | User-registered | User-defined | Public + Client Portal (`/profile`, `/my-tours`, `/favorites`) |

---

## 📱 Real OTP Authentication Workflow

```
[ Signup / Login ] ──► [ User enters Email & Phone (+92) ]
                               │
                               ▼
            [ Choice: Send OTP to Email OR SMS ]
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
[ Gmail SMTP ]                                  [ Twilio SMS ]
- Dispatched via TLS Port 587                   - Dispatched via E.164
- Styled HTML Email Template                    - Normalized +923XXXXXXXXX
       │                                               │
       └───────────────────────┬───────────────────────┘
                               │
                               ▼
        [ 6-Digit Auto-Advancing Input (/verify) ]
                               │
                               ▼
        [ HMAC-SHA256 Token Validation in DB ]
                               │
                               ▼
        [ Issues HttpOnly JWT Cookie (re_auth) ]
```

---

## 📁 Repository Structure

```
├── Database/
│   └── schema.sql                  # SSMS SQL schema with 9 tables, indexes & seed
├── backend/
│   ├── Controllers/
│   │   ├── AuthController.cs       # Signup, Login, RequestOtp, VerifyOtp, Logout
│   │   ├── AccountController.cs    # Client Profile, Password, Contact Change OTP
│   │   ├── PropertiesController.cs # Public property catalog & filters
│   │   ├── AgentsController.cs     # Advisory team
│   │   ├── InquiriesController.cs  # Public contact inquiries
│   │   ├── ToursController.cs      # Tour booking requests & cancellation
│   │   ├── FavoritesController.cs  # Saved favorites management
│   │   ├── StatsController.cs      # Live aggregated KPI metrics
│   │   ├── SettingsController.cs   # Public site settings
│   │   └── Admin/                  # Dedicated Admin controllers
│   │       ├── AdminDashboardController.cs
│   │       ├── AdminPropertiesController.cs
│   │       ├── AdminAgentsController.cs
│   │       ├── AdminToursController.cs
│   │       ├── AdminInquiriesController.cs
│   │       ├── AdminUsersController.cs
│   │       ├── AdminSettingsController.cs
│   │       └── AdminUploadsController.cs
│   ├── Data/
│   │   └── ApplicationDbContext.cs # EF Core DbContext
│   ├── Models/                     # EF Core entity models
│   ├── DTOs/                       # Clean request / response DTOs
│   ├── Services/                   # IOtpService, TokenService, Smtp, Twilio, Notifications
│   └── Program.cs                  # ASP.NET Core pipeline configuration
├── app/
│   ├── layout.tsx                  # Root layout with Playfair & Inter typography
│   ├── page.tsx                    # Landing page with interactive search & showcase
│   ├── properties/                 # Catalog search & [id] detail page
│   ├── signup/ & login/            # Luxury authentication portal
│   ├── verify/                     # 2-step OTP channel selection & 6-digit input
│   ├── forgot-password/            # Password recovery flow
│   ├── profile/                    # Client profile & verified contact update
│   ├── my-tours/                   # VIP tour appointment tracker
│   ├── favorites/                  # Client saved estate collection
│   ├── privacy/ & terms/           # Legal documentation
│   └── admin/                      # Executive Administration Dashboard
│       ├── page.tsx                # Dashboard analytics
│       ├── properties/             # Property catalog management & media upload
│       ├── agents/                 # Advisors registry
│       ├── bookings/               # Tour appointments manager & status updates
│       ├── inquiries/              # Correspondence inbox with direct email reply
│       ├── users/                  # Client directory & ban controls
│       └── settings/               # Dynamic brand & contact configuration
├── components/
│   ├── Navbar.tsx & Footer.tsx     # Brand navigation & dynamic settings
│   ├── CustomCursor.tsx            # GSAP 3 inertia cursor
│   ├── PropertyCard.tsx & Grid.tsx # Estate showcase & specs
│   ├── PropertyGallery.tsx         # Fullscreen luxury image viewer
│   ├── TourModal.tsx               # VIP tour booking modal
│   ├── ContactForm.tsx             # Concierge contact inquiry
│   └── admin/                      # Admin components (Sidebar, StatCard, BarChart, etc.)
├── docs/
│   ├── DEPLOYMENT.md               # Complete production deployment guide (IIS/Linux/Vercel)
│   ├── ADMIN_GUIDE.md              # Client administration handbook
│   └── TEST_CHECKLIST.md           # End-to-end verification checklist
└── lib/
    ├── api.ts                      # Typed API client with credentials: 'include'
    ├── types.ts                    # TypeScript data contracts
    └── format.ts                   # PKR currency and date formatting utilities
```

---

## 📖 Additional Documentation

For in-depth operational and maintenance procedures, consult the `docs/` library:
- [DEPLOYMENT.md](file:///d:/Real%20Estate%20&%20Property%20Management/docs/DEPLOYMENT.md): Production server configuration, IIS/Kestrel reverse proxy, SSL setup, and environment variables.
- [ADMIN_GUIDE.md](file:///d:/Real%20Estate%20&%20Property%20Management/docs/ADMIN_GUIDE.md): Client manual for estate advisors, managing listings, scheduling tours, and responding to inquiries.
- [TEST_CHECKLIST.md](file:///d:/Real%20Estate%20&%20Property%20Management/docs/TEST_CHECKLIST.md): 50-point step-by-step test matrix covering all user stories, security validation, and edge cases.
