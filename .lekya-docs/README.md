# Lekya Specs — Core System Context & Architecture

Welcome to the comprehensive Lekya Specs repository context guide. This documentation serves as a complete reference for any developer or AI assistant working on this repository.

**Last Updated:** 2026-07-29 (Release v1.0.6 — Hybrid Multi-Carrier Logistics & Excel Audit Engine)

---

## 📂 Repository Structure

```
LEKYASPECS/
├── vercel.json               # Vercel multi-service routing config
├── .lekya-docs/              # ← THIS FOLDER — Full Project Documentation
│   ├── README.md             # Project overview & ecosystem map (this file)
│   ├── backend.md            # Backend API, Hybrid Logistics, Excel/CSV Exporters, DB schema
│   ├── frontend.md           # All pages, Shipment Timelines, Return portal, SpinWheel, UI
│   └── deployment.md         # Vercel + GitHub deployment & env variables guide
├── backend/                  # Node.js + Express + Turso Backend
│   ├── src/
│   │   ├── app.js            # Server entry point, route registration, Webhooks & DB cleaner
│   │   ├── config/
│   │   │   ├── db.js         # Turso client, schema init, migrations
│   │   │   ├── seed.js       # Seed runner (called after migrations)
│   │   │   ├── seed.sql      # SQL base schema
│   │   │   └── schema.sql    # Additional schema definitions (inc. whatsapp_messages, order_returns)
│   │   ├── controllers/
│   │   │   ├── adminController.js           # Admin API handlers, Master Excel & Executive Audit Exporters
│   │   │   ├── authController.js            # Register, login, profile, 6-digit OTP verification (idempotent)
│   │   │   ├── orderController.js           # Orders checkout, Smart Pincode Auto-Router, Razorpay HMAC webhooks
│   │   │   ├── productController.js         # Product catalog queries
│   │   │   ├── sellerController.js          # Seller panel API handlers
      │   │   ├── deliveryController.js        # Delivery agent API handlers
│   │   │   ├── shippingController.js        # Hybrid Logistics Engine (Parcel Uncle + Courier Uncle)
│   │   │   ├── returnController.js          # Customer Self-Service Return & Exchange API
│   │   │   ├── whatsappWebhookController.js # WhatsApp Business API Webhook & 9-Intent Auto-Reply Engine
│   │   │   ├── chatController.js            # Team Chat API handlers
│   │   │   └── crmController.js             # CRM sales pipeline & lead sync
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT + Authorization header & ?token= query parameter gates
│   │   └── utils/
│   │       ├── jwt.js        # Sign/verify JWT tokens
│   │       ├── mailer.js     # Nodemailer Gmail SMTP helpers
│   │       ├── sms.js        # Fast2SMS OTP & SMS notification gateway
│   │       ├── whatsapp.js   # WhatsApp Notification Client
│   │       ├── parcelUncle.js# Parcel Uncle Merchant API helper (Local NCR Hyperlocal)
│   │       └── courierUncle.js# Courier Uncle Pan-India Merchant API helper (v1 Specs)
│   ├── package.json
│   └── .env                  # Local environment variables
│
└── frontend/                 # Next.js + React Frontend
    ├── src/
    │   ├── components/
    │   │   ├── VisionEyeLogo.js # 100% Transparent Vector SVG Eyewear Logo
    │   │   └── SpinWheel.js     # 24-Hour Cooldown Lucky Reward Wheel with Countdown Timer
    │   ├── pages/
    │   │   ├── _app.js          # Layout, Auth/Cart/Wishlist/Toast contexts, Expandable Widgets
    │   │   ├── index.js         # Homepage & Group Ecosystem showcase
    │   │   ├── about.js         # Corporate About Us & Group Companies Ecosystem
    │   │   ├── shop.js          # Catalog with filters + comparison tray
    │   │   ├── admin.js         # Admin dashboard, Master Excel & Executive Audit Report Exporters, Vertical Shipment Timeline
    │   │   ├── admin-map.js     # Admin live rider tracking map
    │   │   ├── seller.js        # Seller panel dashboard with dynamic courier partner badges
    │   │   ├── delivery.js      # Delivery agent panel
    │   │   ├── delivery-map.js  # Rider route optimizer map
    │   │   ├── ho-staff.js      # HO Staff EOD reporting & task hub
    │   │   ├── crm.js           # Enterprise CRM & Sales Intelligence studio
    │   │   ├── chat.js          # Fullscreen Team Messaging & Chat panel
    │   │   ├── account.js       # Customer portal, Vertical Shipment Tracking Timeline, 6-digit OTP entry, Return portal
    │   │   ├── checkout.js      # Razorpay + prescription wizard + coupons + Order Confirmation
    │   │   ├── ar-tryon.js      # Live AR webcam try-on
    │   │   ├── face-shape.js    # Face Shape Analyzer
    │   │   ├── skin-analysis.js # Skin Tone Studio
    │   │   ├── customizer.js    # SVG bespoke frame builder
    │   │   ├── lens-guide.js    # Interactive prescription lens studio
    │   │   ├── lookbook.js      # 3D Glassmorphism animated SVG hero lookbook
    │   │   ├── contact.js       # Contact form page
    │   │   └── product/
    │   │       └── [id].js      # Product detail + prescription configurator
    │   └── styles/
    │       └── globals.css      # Vanilla CSS design system, mobile responsive breakpoints
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

## 🔐 Admin Credentials

| Field    | Value                         |
|----------|-------------------------------|
| Email    | `dev.parceluncle@gmail.com`   |
| Password | `14912malik`                  |
| Role     | `admin` (super administrator) |

---

## 🚀 Key System Features (Updated July 24, 2026)

1. **WhatsApp Business Cloud API Webhook**:
   - Live endpoint: `/api/webhooks/whatsapp`
   - Auto-reply engine detecting 9 distinct customer intents (order tracking, frame catalog, face consultation, prescription, returns, human support, coupons).
   - Customer phone-to-account matching and CRM message logging (`whatsapp_messages` table).

2. **Self-Service Return & Exchange Hub**:
   - Customer portal inside `/account` for requesting Frame Exchanges or Full Refunds.
   - Structured reason selectors, custom notes, and Parcel Uncle Express doorstep reverse pickup integration.
   - Admin management endpoint: `/api/admin/returns`.

3. **3D Glassmorphism Lookbook**:
   - Pure CSS/SVG 3D interactive spectacle visualization with perspective tilt, gradient floating orbs, and particle effects.

4. **Interactive 6-Box OTP Entry & 3D Celebration**:
   - 6 individual digit input boxes with auto-advance, auto-focus, paste handling, error shake animation, and 3D confetti modal on successful verification.

5. **24-Hour Cooldown Spin & Win Wheel**:
   - Daily limit logic using `localStorage` with a live countdown timer until next available spin.

6. **Expandable Bottom-Right WhatsApp Concierge**:
   - Repositioned floating stack with 3 direct action links (Track Order, Frame Consultation, General Chat).

---

## 🛠️ Tech Stack Overview

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (Pages Router) + React |
| Styling | Vanilla CSS + Tailwind CSS utilities |
| Backend | Node.js + Express |
| Database | Turso (LibSQL/SQLite) — hosted cloud |
| WhatsApp API | Meta WhatsApp Business Cloud API (`v19.0`) |
| Logistics | Parcel Uncle Merchant API v1.0.3 (Waybill, Reverse Pickup, Labels) |
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
