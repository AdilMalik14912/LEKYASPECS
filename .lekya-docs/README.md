# Lekya Specs — Core System Context & Architecture

Welcome to the comprehensive Lekya Specs repository context guide. This documentation serves as a complete reference for any developer or AI assistant working on this repository.

**Last Updated:** 2026-07-11

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
│   │   │   ├── adminController.js      # All admin API handlers
│   │   │   ├── authController.js       # Register, login, profile
│   │   │   ├── orderController.js      # Orders, payment, reviews, coupons
│   │   │   ├── productController.js    # Product catalog queries
│   │   │   ├── sellerController.js     # Seller panel API handlers ← NEW
│   │   │   └── deliveryController.js   # Delivery agent API handlers ← NEW
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT + isAdmin + isSeller + isDelivery gates
│   │   └── utils/
│   │       ├── jwt.js        # Sign/verify JWT tokens
│   │       └── mailer.js     # Nodemailer Gmail SMTP helpers
│   ├── package.json
│   └── .env                  # Local environment variables
│
└── frontend/                 # Next.js + React Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── _app.js          # Layout, Auth/Cart/Wishlist/Toast contexts
    │   │   ├── index.js         # Homepage
    │   │   ├── shop.js          # Catalog with filters + comparison tray
    │   │   ├── admin.js         # Full admin dashboard (12+ features)
    │   │   ├── admin-map.js     # Admin live rider tracking map ← NEW
    │   │   ├── seller.js        # Seller panel dashboard ← NEW
    │   │   ├── delivery.js      # Delivery agent panel ← NEW
    │   │   ├── delivery-map.js  # Rider route optimizer map ← NEW
    │   │   ├── account.js       # User dashboard + loyalty + tracking
    │   │   ├── checkout.js      # Razorpay + prescription wizard + coupons
    │   │   ├── ar-tryon.js      # Live AR webcam try-on
    │   │   ├── face-shape.js    # AI face shape detector
    │   │   ├── skin-analysis.js # Skin tone AI lab
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

## 🔐 Admin Access

| Field    | Value                         |
|----------|-------------------------------|
| URL      | `https://lekyaspecs.vercel.app/admin` |
| Email    | `dev.parceluncle@gmail.com`   |
| Password | `14912malik`                  |

> Sub-admins can be created from inside the Admin Panel → "Admin Roles" tab.

---

## 👤 Role System (RBAC)

The platform has 4 user roles managed via the `role` column in `users` table:

| Role | Access |
|------|--------|
| `user` | Customer — shopping, account, orders |
| `seller` | Seller Panel (`/seller`) — orders, inventory, rider assignment |
| `delivery` | Delivery Panel (`/delivery`) — deliveries, route map |
| `admin` | Full Admin Panel + all seller/delivery features |

Roles are assigned from Admin → Team Management tab. Middleware: `isSeller`, `isDelivery`, `isAdmin` in `auth.js`.

---

## 🎨 Design System

- **Palette:** Rich Black (`#0A0A0A`/`#121212`) + Metallic Gold (`#C5A028`) + Off-white
- **Typography:** Inter / Outfit (Google Fonts)
- **Effects:** Glassmorphism, micro-animations, gold borders, premium dark panels
- **CSS:** Pure Vanilla CSS in `globals.css` — no Tailwind
- **Map Pages:** Use inline CSS (not Tailwind) + Leaflet.js CartoDB Dark tiles

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
|-------||-----------|
| Frontend | Next.js (Pages Router) + React |
| Styling | Vanilla CSS (map pages use inline styles) |
| Backend | Node.js + Express |
| Database | Turso (LibSQL/SQLite) — hosted cloud |
| Maps | Leaflet.js + CartoDB Dark Matter tiles + Nominatim geocoding |
| AI Engine | face-api.js (TinyFaceDetector + FaceLandmark68) via CDN |
| Payment | Razorpay API + local sandbox simulator |
| Email | Nodemailer + Google SMTP (Gmail App Passwords) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| OAuth | Passport.js (Google OAuth, auto-mocked if keys missing) |
| Icons | lucide-react |
| Deploy | Vercel (both frontend + backend as separate services) |
| Repo | GitHub → `AdilMalik14912/LEKYASPECS` |

---

## 🚀 Features Added (2026-07-05)

### Customer-Facing
1. **Virtual Try-On Studio** (`/tryon`) — Webcam + smart BG removal + 8 SVG frames + 10 colors + Before/After + Save PNG
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

### Curation-Specific
11. **Brand Stylist & Curation Hub** (`/stylist`) — Lookbook, Face Advisor, Spotlight, Style Tags, Color Stories, Calendar, Brand Voice Checker

---

## 🚀 Features Added (2026-07-10) — MAJOR UPDATE

### Seller Panel (`/seller`) — Full B2B Dashboard
12. **Seller Panel** — Complete dark-themed seller dashboard with 4 tabs:
    - **Dashboard** — Stats cards (total orders, revenue, products, agents), low stock alerts, recent orders
    - **Orders** — Filter by status, search, assign delivery agent, update status
    - **Inventory** — Product list with stock levels, add/edit products
    - **Delivery Agents** — List all agents with their active order counts

### Delivery Agent Panel (`/delivery`) — Rider Dashboard
13. **Delivery Panel** — Complete dark-themed delivery agent dashboard:
    - **My Deliveries** — View all assigned orders with status progress stepper
    - **Available Orders** — Claim unassigned paid orders (city-grouped with urgent badges)
    - **Dashboard** — Stats: delivered, active, shipped count

### Smart Rider Assignment System (Seller Panel)
14. **Auto-Assign** 🤖 — Button on each unassigned order → assigns to least-busy agent automatically
15. **Urgent/Express Flag** ⚡ — Mark any order as urgent with a reason note; shows red badge everywhere
16. **Agent Workload Modal** 📊 — Popup showing each agent's active orders, success rate, and performance bar
17. **Agent Performance Leaderboard** 🏆 — Dashboard widget ranking agents by success rate (🥇🥈🥉)
18. **Stale Orders Alert** 🔔 — Red alert panel on dashboard for unassigned paid orders older than 1 hour
19. **City-Grouped Delivery** 📍 — Available orders grouped by city in delivery panel for route efficiency

### Real-Time Map System
20. **Delivery Route Map** (`/delivery-map`) — Full-screen gorgeous rider route optimizer:
    - CartoDB Dark Matter map tiles (stunning dark theme)
    - Browser GPS tracking → updates backend every 30s
    - Animated pulsing blue truck marker for rider location
    - Numbered order markers (color-coded by status)
    - Dashed amber route polyline: rider → stop1 → stop2 → ...
    - Stats panel: stops, km distance, estimated time, urgent count
    - Order card scroll strip to jump to any stop on map
    - "Open in Google Maps" → full turn-by-turn navigation

21. **Admin Live Rider Tracker** (`/admin-map`) — Full-screen real-time admin tracking:
    - All rider locations as animated truck markers (each rider a unique color)
    - Online/Idle/Offline status detection (< 5min / < 30min / never)
    - Dashed route lines connecting rider to their active order delivery points
    - Left sidebar: stats (online/idle/offline count), click rider → see their orders
    - Auto-refresh polling every 10 seconds
    - "🛰 Live Rider Map" link in Admin sidebar

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
