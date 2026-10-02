# REAL ESTATE — End-to-End Acceptance Test Checklist

Use this checklist to verify every user journey, security check, and administrative action before handing the system over to the client.

---

### 1. Database & Infrastructure
- [ ] Run `Database/schema.sql` in SSMS against `RealEstateDb`. All 9 tables and seeded records created.
- [ ] `GET http://localhost:5000/health` returns `status: "Healthy"`, `database: "Connected"`.
- [ ] Verify `backend/appsettings.Development.json` is ignored by Git (`.gitignore`).

---

### 2. Client Authentication & Real OTP Flow
- [ ] **Signup by Email OTP**:
  - [ ] Visit `/signup`. Complete form with valid email and phone (`+923001234567`).
  - [ ] Check password strength meter reacts to character variety.
  - [ ] Agree to Terms & Privacy Policy checkbox. Click *Continue to Verification*.
  - [ ] On `/verify`, select **Email Dispatch**. Click *Send Code*.
  - [ ] Verify 6-digit code received in email inbox.
  - [ ] Type 6-digit code. Boxes auto-advance. On 6th digit, system auto-submits.
  - [ ] Successfully logged in with welcome toast. Cookie `re_auth` set in browser.
- [ ] **Signup by SMS OTP**:
  - [ ] Complete signup form.
  - [ ] On `/verify`, select **Mobile SMS Dispatch**. Click *Send Code*.
  - [ ] Verify SMS received on phone via Twilio.
  - [ ] Enter code and establish authenticated session.
- [ ] **Wrong / Expired Code**:
  - [ ] Enter an incorrect code (e.g. `999999`).
  - [ ] Input boxes shake, turn red, and display remaining attempts.
  - [ ] After 5 wrong attempts, verify code is dead.
- [ ] **Resend Cooldown**:
  - [ ] Verify 60-second cooldown timer locks *Resend code* button.
  - [ ] Verify button unlocks at 0s.
- [ ] **Login Flow**:
  - [ ] Visit `/login`. Enter identifier (email or phone) and password.
  - [ ] Redirected to `/verify` with challenge token.
  - [ ] Verify code and confirm login redirects to requested page.
- [ ] **Account Lockout Protection**:
  - [ ] Enter wrong password 5 consecutive times on `/login`.
  - [ ] Verify account locks for 15 minutes with HTTP 423 status message.
- [ ] **Password Reset Flow**:
  - [ ] Visit `/forgot-password`. Enter registered email or phone.
  - [ ] Receive 6-digit reset code.
  - [ ] Enter code and set new 8+ char password.
  - [ ] Log in successfully with new credentials.
- [ ] **Logout**:
  - [ ] Click *Sign Out*. Cookie `re_auth` deleted. Protected pages redirect to `/login`.

---

### 3. Public Website Features
- [ ] **Custom GSAP Cursor**:
  - [ ] Smooth inertia lag on desktop.
  - [ ] Expands over buttons, property cards, and links.
  - [ ] Disabled on touch devices and suppressed inside `/admin`.
- [ ] **Homepage & Search**:
  - [ ] Hero search bar filters by city, typology, or keyword, navigating to `/properties`.
  - [ ] StatsCounter displays real numbers from database (Active Listings, Sold, Cities, Clients).
  - [ ] Managing Advisors showcase displays active agents from database.
- [ ] **Property Listing (`/properties`)**:
  - [ ] Search text, city dropdown, price range, beds, and sorting update results.
  - [ ] Filters synchronize with URL query string.
  - [ ] Pagination navigates pages cleanly.
- [ ] **Property Detail (`/properties/[id]`)**:
  - [ ] Fullscreen gallery lightbox with Next/Previous navigation and Escape key listener.
  - [ ] 3 similar properties displayed at the bottom.
  - [ ] Assigned advisor card shows photo, phone, and direct WhatsApp link.
- [ ] **Inquiry Submissions**:
  - [ ] Submit contact form on homepage and on property detail page.
  - [ ] Stored in `Inquiries` table. Email alert sent to site contact email.

---

### 4. Client Area (Protected)
- [ ] **Favorites**:
  - [ ] Click Heart icon when logged out -> redirected to `/login` with return URL.
  - [ ] Click Heart icon when logged in -> saves property to `/favorites`.
  - [ ] Remove from favorites updates immediately.
- [ ] **Private Tour Scheduling**:
  - [ ] Click *Schedule Private Tour* on property detail page.
  - [ ] Select future date and time.
  - [ ] Confirms booking, creates `Pending` row in `TourBookings`, sends confirmation email to client.
  - [ ] Blocking rule: Attempting to book a second pending tour for the same property returns conflict.
  - [ ] Blocking rule: Attempting to book a Sold/Rented property is rejected.
- [ ] **My Tours (`/my-tours`)**:
  - [ ] Displays all user bookings with status badges and concierge notes.
  - [ ] Click *Cancel Appointment* behind confirmation dialog -> status updates to `Cancelled`.
- [ ] **Profile (`/profile`)**:
  - [ ] Update legal full name.
  - [ ] Change password (requires correct current password).
  - [ ] Request email or phone change -> code sent to NEW destination -> verified and saved.

---

### 5. Admin Panel (`/admin` — Protected: Admin Only)
- [ ] Non-admin / visitor accessing `/admin` is redirected to `/login`.
- [ ] Admin login lands on `/admin` executive dashboard.
- [ ] **Dashboard**:
  - [ ] KPI cards match database counts.
  - [ ] 30-Day SVG bar chart renders demand trend.
  - [ ] Recent bookings and inquiries display with direct links.
- [ ] **Properties Management (`/admin/properties`)**:
  - [ ] Add new estate with cover image upload (multipart JPG/PNG/WEBP).
  - [ ] Edit existing estate.
  - [ ] Soft delete hides property from public site without deleting SQL record.
- [ ] **Advisors Management (`/admin/agents`)**:
  - [ ] Register new advisor with portrait photo.
  - [ ] Edit advisor details or deactivate.
- [ ] **Tour Bookings (`/admin/bookings`)**:
  - [ ] Filter by status (Pending, Confirmed, Completed, Cancelled).
  - [ ] Open booking, enter concierge note, and click *Confirm Appointment*.
  - [ ] Client receives branded status update email.
- [ ] **Client Inquiries (`/admin/inquiries`)**:
  - [ ] Opening inquiry marks status as *Read*.
  - [ ] Type response in reply box and click *Transmit Email Reply*.
  - [ ] Client receives branded email reply. Inquiry status updates to *Replied*.
- [ ] **Users & Security (`/admin/users`)**:
  - [ ] Search registered clients.
  - [ ] Click *Block User* -> User blocked and cannot log in.
  - [ ] Self-protection: Admin cannot block their own account.
- [ ] **Site Settings (`/admin/settings`)**:
  - [ ] Update company name, phone, WhatsApp line, or address.
  - [ ] Changes immediately reflect in public navbar, footer, and emails.
