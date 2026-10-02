# REAL ESTATE — Enterprise Production Deployment Guide

This guide details the complete production architecture, IIS / Windows Server hosting, database configuration, domain hierarchy, and security posture for the **REAL ESTATE** platform.

---

## 1. Architecture & Domain Topology

To allow cross-subdomain HttpOnly SameSite cookie authentication (`re_auth`) between the frontend client and the backend API, the application must be deployed under a unified parent domain:

| Component | Target URL | Notes |
| :--- | :--- | :--- |
| **Public Website & Client Area** | `https://realestate.com` (or `www.realestate.com`) | Next.js Node.js host / Vercel / IIS |
| **Backend REST API Engine** | `https://api.realestate.com` | ASP.NET Core 8 Web API / IIS / Kestrel |
| **Shared Cookie Scope** | Domain: `.realestate.com` | HttpOnly, Secure, SameSite=Lax |

> [!IMPORTANT]
> Because authentication uses an HttpOnly `re_auth` cookie, hosting the frontend and API on different root domains (e.g. `vercel.app` and `azurewebsites.net`) without a custom domain will prevent cookie transmission under modern browser third-party cookie restrictions.

---

## 2. Production Database Deployment (SQL Server)

1. Connect to your production SQL Server Instance in SQL Server Management Studio (SSMS).
2. Open and execute [`Database/schema.sql`](../Database/schema.sql).
3. The script:
   - Validates if `RealEstateDb` exists or creates it safely.
   - Creates all 9 relational tables with indexes, foreign key constraints, and default timestamps.
   - Seeds luxury estates, advisor profiles, gallery images, and initial site configuration.
4. Create a dedicated SQL Server user with `db_datareader` and `db_datawriter` roles on `RealEstateDb`.

---

## 3. Backend API Publishing (ASP.NET Core 8)

### Option A: Publishing via CLI
From the project root:
```powershell
cd backend
dotnet publish -c Release -o C:\inetpub\wwwroot\realestate-api
```

### Option B: IIS Configuration
1. Install **.NET 8 Hosting Bundle** on the Windows Server.
2. In IIS Manager, create an Application Pool:
   - **.NET CLR Version**: `No Managed Code`
   - **Managed Pipeline Mode**: `Integrated`
3. Add a new Website in IIS:
   - **Site name**: `RealEstate.Api`
   - **Physical path**: `C:\inetpub\wwwroot\realestate-api`
   - **Binding**: HTTPS, Port 443, Host name `api.realestate.com`
4. Configure production environment in `appsettings.Production.json` or Environment Variables:
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `ConnectionStrings__DefaultConnection=Server=PROD-SQL;Database=RealEstateDb;User Id=...;Password=...;TrustServerCertificate=False;Encrypt=True;`
   - `Jwt__Secret=YOUR_CRYPTOGRAPHICALLY_SECURE_RANDOM_SECRET_KEY_MIN_64_CHARS`
   - `Otp__HashSecret=YOUR_HMAC_SHA256_SERVER_SALT_SECRET_KEY`
   - `Smtp__Host=smtp.sendgrid.net` (or Gmail/AWS SES)
   - `Smtp__Port=587`
   - `Smtp__Username=apikey`
   - `Smtp__Password=YOUR_SENDGRID_OR_GMAIL_KEY`
   - `Twilio__AccountSid=YOUR_TWILIO_SID`
   - `Twilio__AuthToken=YOUR_TWILIO_TOKEN`
   - `Twilio__FromNumber=+1234567890`
   - `Cors__AllowedOrigins__0=https://realestate.com`
   - `Cors__AllowedOrigins__1=https://www.realestate.com`

---

## 4. Frontend Publishing (Next.js 14)

### Production Build
From the project root:
```powershell
npm run build
```

### Environment Configuration (`.env.production`)
Create `.env.production` containing:
```env
NEXT_PUBLIC_API_URL=https://api.realestate.com
NEXT_PUBLIC_BRAND_NAME=REAL ESTATE
NEXT_PUBLIC_DEFAULT_COUNTRY_CODE=+92
NEXT_PUBLIC_CURRENCY=PKR
```

### Hosting with PM2 or Windows Service
Run using Node.js:
```powershell
npm run start
```
Or bind to port 3000 behind IIS / NGINX reverse proxy forwarding requests to `http://localhost:3000`.

---

## 5. Security Checklist
- [x] SSL/TLS certificates active for `realestate.com` and `api.realestate.com`.
- [x] HSTS and Security Headers enforced (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`).
- [x] Rate limiting middleware active on `/api/auth/*` and `POST /api/inquiries`.
- [x] Passwords securely hashed with BCrypt (Cost Factor 12).
- [x] OTP codes stored exclusively as HMAC-SHA256 hashes.
