# Lekya Specs — Core System Context & Architecture

Welcome to the comprehensive Lekya Specs repository context guide. This documentation serves as a complete reference for any developer or AI assistant working on this repository.

**Last Updated:** 2026-07-04

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
│   │   ├── app.js            # Server entry point & all route registrations
│   │   ├── config/
│   │   │   ├── db.js         # Turso client, schema init, migrations
│   │   │   ├── seed.js       # Seed runner (called after migrations)
│   │   │   ├── seed.sql      # SQL base schema
│   │   │   └── schema.sql    # Additional schema definitions
│   │   ├── controllers/
│   │   │   ├── adminController.js   # All admin API handlers
│   │   │   ├── authController.js    # Register, login, profile
│   │   │   ├── orderController.js   # Orders, payment, reviews, coupons
│   │   │   └── productController.js # Product catalog queries
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT verification + isAdmin gate
│   │   └── utils/
│   │       ├── jwt.js        # Sign/verify JWT tokens
│   │       └── mailer.js     # Nodemailer Gmail SMTP helpers
│   ├── package.json
│   └── .env                  # Local environment variables
│
└── frontend/                 # Next.js + React Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── _app.js       # Layout, Auth/Cart/Wishlist/Toast contexts
    │   │   ├── index.js      # Homepage
    │   │   ├── shop.js       # Catalog with filters + comparison tray
    │   │   ├── admin.js      # Full admin dashboard (10+ features)
    │   │   ├── account.js    # User dashboard + loyalty + tracking
    │   │   ├── checkout.js   # Razorpay + prescription wizard + coupons
    │   │   ├── ar-tryon.js   # Live AR webcam try-on
    │   │   ├── face-shape.js # AI face shape detector
    │   │   ├── skin-analysis.js # Skin tone AI lab
    │   │   ├── customizer.js # SVG bespoke frame builder
    │   │   ├── lens-guide.js # Interactive prescription lens studio
    │   │   ├── lookbook.js   # Editorial lookbook
    │   │   ├── contact.js    # Contact form page
    │   │   └── product/
    │   │       └── [id].js   # Product detail + prescription configurator
    │   └── styles/
    │       └── globals.css   # Full Vanilla CSS design system
    ├── package.json
    └── .env.local            # Frontend environment config
```

---

## 🔐 Admin Access

| Field    | Value                         |
|----------|-------------------------------|
| URL      | `http://localhost:3000/admin` |
| Email    | `dev.parceluncle@gmail.com`   |
| Password | `14912malik`                  |

> Sub-admins can be created from inside the Admin Panel → "Admin Roles" tab.

---

## 🎨 Design System

- **Palette:** Rich Black (`#0A0A0A`/`#121212`) + Metallic Gold (`#C5A028`) + Off-white
- **Typography:** Inter / Outfit (Google Fonts)
- **Effects:** Glassmorphism, micro-animations, gold borders, premium dark panels
- **CSS:** Pure Vanilla CSS in `globals.css` — no Tailwind

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
|-------|-----------|
| Frontend | Next.js (Pages Router) + React |
| Styling | Vanilla CSS |
| Backend | Node.js + Express |
| Database | Turso (LibSQL/SQLite) — hosted cloud |
| AI Engine | face-api.js (TinyFaceDetector + FaceLandmark68) via CDN |
| Payment | Razorpay API + local sandbox simulator |
| Email | Nodemailer + Google SMTP (Gmail App Passwords) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| OAuth | Passport.js (Google OAuth, auto-mocked if keys missing) |
| Icons | lucide-react |
| Deploy | Vercel (both frontend + backend as separate services) |
| Repo | GitHub → `AdilMalik14912/LEKYASPECS` |

---

## 🚀 New Features Added (2026-07-05)

### Customer-Facing
1. **Virtual Try-On Studio** (`/tryon`) — Fully overhauled with 5 new sub-features:
   - **Smart BG Removal Engine** — Canvas `getImageData()` strips white/grey backgrounds from catalog product images pixel-by-pixel with configurable tolerance slider
   - **Live Webcam Mode** — `getUserMedia()` real-time webcam feed with glasses overlay + Snap Photo button
   - **Mirror Mode** — Flip preview horizontally for natural mirror experience
   - **Before/After Split View** — Drag divider to compare face without vs with glasses
   - **8 Premium SVG Frames** — Wayfarer, Round, Aviator, Cat-Eye, Rectangle, Hexagonal, Rimless, Browline (all with drop shadows + glass tint)
   - **10 Frame Colors** — Noir, Gold, Rose Gold, Silver, Tortoise, Navy, Crimson, Forest, Crystal, Amber
2. **AI Face Scanner** (`/account`) — Simulated scan saving face shape to profile
3. **Product Comparison Tray** (`/shop`) — Compare up to 3 frames side by side
4. **Prescription Lens Configurator** (`/product/[id]`) — Live dynamic pricing with lens index + coatings
5. **Specs Rewards Club** (`/account`) — Loyalty points, tier (Bronze/Silver/Gold), referral link

### Admin-Only
6. **Support Helpdesk** — View & reply to contact form submissions via email
7. **DB Optimizer** — Live DB health stats + one-click VACUUM
8. **Inspect Customer** — Deep-dive overlay: profile + full order history per customer
9. **Order Dispatch Notes** — Add tracking/shipping updates per order
10. **Coupon Validation** — Real-time coupon validator at checkout

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
