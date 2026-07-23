# Lekya Specs — Core System Context & Architecture

Welcome to the comprehensive Lekya Specs repository context guide. This documentation serves as a complete reference for any developer or AI assistant working on this repository.

# Lekya Specs — Core System Context & Architecture

Welcome to the comprehensive Lekya Specs repository context guide. This documentation serves as a complete reference for any developer or AI assistant working on this repository.

**Last Updated:** 2026-07-17

---

## 📂 Repository Structure

```
LEKYASPECS/
├── vercel.json               # Vercel multi-service routing config
├── .lekya-docs/              # ← THIS FOLDER — Project context docs
│   ├── README.md             # Project overview (this file)
│   ├── backend.md            # Backend API, DB schema, credentials
│   ├── frontend.md           # All pages & features documentation
│   └── deployment.md         # Vercel + GitHub deployment guide
├── backend/                  # Node.js + Express + Turso Backend
│   ├── src/
│   │   ├── app.js            # Server entry point, route registration & hourly DB cleaner
│   │   ├── config/
│   │   │   ├── db.js         # Turso client, schema init, migrations
│   │   │   ├── seed.js       # Seed runner (called after migrations)
│   │   │   ├── seed.sql      # SQL base schema
│   │   │   └── schema.sql    # Additional schema definitions
│   │   ├── controllers/
│   │   │   ├── adminController.js      # All admin API handlers & refunds
│   │   │   ├── authController.js       # Register, login, profile, Fast2SMS OTP
│   │   │   ├── orderController.js      # Orders, Razorpay HMAC webhooks, reviews, coupons
│   │   │   ├── productController.js    # Product catalog queries
│   │   │   ├── sellerController.js     # Seller panel API handlers
│   │   │   ├── deliveryController.js   # Delivery agent API handlers
│   │   │   ├── shippingController.js   # Parcel Uncle logistics API suite (v1.0.3)
│   │   │   ├── chatController.js       # Team Chat API handlers
│   │   │   └── crmController.js        # CRM sales pipeline & lead sync
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT + isAdmin + isSeller + isDelivery + isTeamMember gates
│   │   └── utils/
│   │       ├── jwt.js        # Sign/verify JWT tokens
│   │       ├── mailer.js     # Nodemailer Gmail SMTP helpers
│   │       ├── sms.js        # Fast2SMS OTP & SMS notification gateway
│   │       └── parcelUncle.js# Official Parcel Uncle Merchant API integration (LIVE key, Label PDF, Webhook, NDR, Rates)
│   ├── package.json
│   └── .env                  # Local environment variables
│
└── frontend/                 # Next.js + React Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── _app.js          # Layout, Auth/Cart/Wishlist/Toast contexts, Group Companies dropdown
    │   │   ├── index.js         # Homepage & Group Ecosystem showcase
    │   │   ├── about.js         # Corporate About Us & Group Companies Ecosystem ← NEW (2026-07-16)
    │   │   ├── shop.js          # Catalog with filters + comparison tray
    │   │   ├── admin.js         # Full admin dashboard & Tax Invoice HTML generator
    │   │   ├── admin-map.js     # Admin live rider tracking map
    │   │   ├── seller.js        # Seller panel dashboard
    │   │   ├── delivery.js      # Delivery agent panel
    │   │   ├── delivery-map.js  # Rider route optimizer map
    │   │   ├── ho-staff.js      # HO Staff EOD reporting & task hub ← NEW (2026-07-16)
    │   │   ├── crm.js           # Enterprise CRM & Sales Intelligence studio
    │   │   ├── chat.js          # Fullscreen Team Messaging & Chat panel
    │   │   ├── account.js       # User dashboard, orders, loyalty, tax invoice download
    │   │   ├── checkout.js      # Razorpay + prescription wizard + coupons
    │   │   ├── ar-tryon.js      # Live AR webcam try-on
    │   │   ├── face-shape.js    # Face Shape Analyzer
    │   │   ├── skin-analysis.js # Skin Tone Studio
    │   │   ├── customizer.js    # SVG bespoke frame builder
    │   │   ├── lens-guide.js    # Interactive prescription lens studio
    │   │   ├── lookbook.js      # Editorial lookbook
    │   │   ├── contact.js       # Contact form page
    │   │   └── product/
    │   │       └── [id].js      # Product detail + prescription configurator
    │   └── styles/
    │       └── globals.css      # Full Vanilla CSS design system
    ├── package.json
    └── .env.local               # Frontend environment config
```

---

## 🏢 Lekya Group Corporate Ecosystem

Lekya Specs operates as part of the broader **Lekya Group** corporate ecosystem:

| Entity | Domain | Category | Core Mission |
|--------|--------|----------|--------------|
| **Lekya Specs** | `lekyaspecs.com` | Luxury Eyewear & Optics | Precision 3D virtual fitting & luxury hand-polished acetate frames |
| **Lekya Logistics** | `lekyalogistics.com` | Pan-India Freight Logistics | Smart fulfillment hubs & B2B express line-haul transportation |
| **Parcel Uncle** | `parceluncle.com` | Hyperlocal Courier Network | API-driven automated dispatch & same-day urban shipping |
| **Infinior Advisors** | `infinioradvisors.com` | Corporate Growth Advisory | M&A advisory, capital structuring, and corporate governance |
| **Lekya Energy** | `lekyaenergy.com` | Clean Solar Energy | Utility-scale solar parks & industrial green power transitions |

---

## 🔐 Admin Access

| Field    | Value                         |
|----------|-------------------------------|
| URL      | `https://lekyaspecs.vercel.app/admin` |
| Email    | `dev.parceluncle@gmail.com`   |
| Password | `14912malik`                  |

> Sub-admins can be created from inside the Admin Panel → "Admin Roles" tab.

---

## 👤 Role System (RBAC)

The platform has 5 user roles managed via the `role` column in `users` table:

| Role | Access |
|------|--------|
| `user` | Customer — shopping, account, orders, invoice download |
| `seller` | Seller Panel (`/seller`) — orders, inventory, rider assignment |
| `delivery` | Delivery Panel (`/delivery`) — deliveries, route map, delivery OTP verification |
| `ho_staff` | Head Office Staff (`/ho-staff`) — EOD work reporting, task tracking, team chat |
| `admin` | Full Admin Panel + all seller/delivery/HO staff features |

Roles are assigned from Admin → Team Management tab. Middleware: `isSeller`, `isDelivery`, `isAdmin`, `isTeamMember` in `auth.js`.

---

## 🎨 Design System

- **Palette:** Rich Black (`#0A0A0A`/`#121212`) + Metallic Gold (`#C5A028`) + Off-white
- **Typography:** Inter / Outfit (Google Fonts)
- **Effects:** Glassmorphism, micro-animations, gold borders, premium dark panels
- **CSS:** Pure Vanilla CSS in `globals.css` — no Tailwind
- **Map Pages:** Use inline CSS (not Tailwind) + Leaflet.js CartoDB Dark tiles
- **Branding Standard:** Human-crafted optical terminology (`Face Shape Analyzer`, `Precision 3D Fitting`, `Smart Discovery Lab`). All raw "AI" buzzwords have been removed from public UI.

---

## ⚡ API Base URL Routing

| Environment | Frontend Port | Backend Port | API_BASE |
|-------------|---------------|--------------|----------|
| Local Dev   | 3000          | 5000         | `http://localhost:5000` |
| Production (Vercel) | same origin | `/api/*` routed | `''` (empty — relative) |

The `API_BASE` auto-detects from `window.location.hostname` at runtime.

---

## 📚 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (Pages Router) + React |
| Styling | Vanilla CSS (map pages use inline styles) |
| Backend | Node.js + Express |
| Database | Turso (LibSQL/SQLite) — hosted cloud |
| Maps | Leaflet.js + CartoDB Dark Matter tiles + Nominatim geocoding |
| Precision Vision | face-api.js (TinyFaceDetector + FaceLandmark68) via CDN |
| Payment & Refunds | Razorpay API + HMAC-SHA256 Webhook handler + Auto-Refunds |
| OTP & Messaging | Fast2SMS API Gateway + Nodemailer SMTP fallback |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| OAuth | Passport.js (Google OAuth, auto-mocked if keys missing) |
| Icons | lucide-react |
| Deploy | Vercel (both frontend + backend as separate services) |
| Repo | GitHub → `AdilMalik14912/LEKYASPECS` |

---

## 🚀 Features Added (2026-07-16 / 2026-07-17) — RECENT UPDATE

### Corporate Ecosystem & About Page
1. **Corporate About Us Page** (`/about`) — Full interactive brand story, core values, key metrics, and Group Ecosystem showcase (`lekyalogistics.com`, `parceluncle.com`, `infinioradvisors.com`, `lekyaenergy.com`).
2. **Navbar Group Companies Dropdown** (`_app.js`) — Visual navigation dropdown matching exact corporate branding with vector logo badges and direct website links.

### Backend Infrastructure & Security
3. **Razorpay HMAC Webhook & Auto-Refund Engine** — `orderController.js` and `adminController.js` verifying `x-razorpay-signature` and executing instant Razorpay API refunds.
4. **Dual Fast2SMS + Email OTP Gateway** — Fast2SMS text message OTP delivery with fallback to Gmail SMTP.
5. **Instant CRM Lead Sync** — `upsertCrmLeadFromUser()` auto-syncs newly registered users into the sales CRM pipeline instantly.
6. **Hourly DB Janitor Routine** — `app.js` runs cron cleaning expired OTP records and stale user sessions every 60 minutes.

### UI / UX Refinements & Bug Fixes
7. **Complete "AI" Terminology Removal** — Replaced all public AI buzzwords with human-crafted, bespoke optical terminology across all 15+ frontend pages.
8. **Direct Tax Invoice HTML Generator & Printer** — Upgraded Tax Invoice modal in `admin.js` to offer standalone `.html` blob file download (`LekyaSpecs_Invoice_INV-000XXX.html`) and direct iframe `@media print` printing without pop-up window blocks. Customer `/account` page also features instant Tax Invoice download.
9. **Staff Panel Auth Gate Protection** — Resolved premature `/account` redirects on `/ho-staff`, `/seller`, `/delivery`, and `/crm` by checking `authLoading` before executing role checks.

---

## 🛠️ Local Dev Setup

```bash
# Start backend
cd backend
node src/app.js         # runs on :5000

# Start frontend  
cd frontend
npm run dev             # runs on :3000
```

Or use the convenience script:
```powershell
.\run-dev.ps1
```
