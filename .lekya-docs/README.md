
# Lekya Specs — Core System Context & Architecture

Welcome to the comprehensive Lekya Specs repository context guide. This documentation is designed to serve as a complete reference for any developer or AI assistant working on the repository. It details every aspect of the project's codebase, structure, features, configurations, and deployment pipeline.

---

## 📂 Repository Structure

```
LEKYASPECS/
├── vercel.json           # Vercel Services multi-project configuration
├── backend/              # Node.js + Express + Turso Backend Service
│   ├── src/
│   │   ├── app.js        # Server entry point (exports app for serverless Vercel)
│   │   ├── config/
│   │   │   ├── db.js     # Turso client client wrapper & database initialization
│   │   │   ├── seed.js   # DB seed runner helper
│   │   │   └── seed.sql  # SQL schema definition & initial records
│   │   ├── controllers/  # Route handlers (auth, admin, orders, products)
│   │   ├── middleware/   # Authentication token and admin gates
│   │   └── utils/        # JWT generators, Gmail SMTP mailer
│   ├── package.json
│   └── .env              # Local environment variables
│
└── frontend/             # Next.js + React Frontend Service
    ├── src/
    │   ├── pages/        # Router pages (shop, ar-tryon, skin-analysis, etc.)
    │   │   ├── _app.js   # Main layout, Context Providers, header & footer
    │   │   ├── index.js  # Homepage with hero slider and tools grid
    │   │   ├── shop.js   # Catalog browsing with sorting and filters
    │   │   ├── ar-tryon.js# Live AR Webcam client try-on engine
    │   │   ├── face-shape.js# Neural-net Face Shape detector
    │   │   ├── skin-analysis.js# Pixel-level undertone and Fitzpatrick shade scanner
    │   │   ├── customizer.js# Bespoke frame & lens customizer
    │   │   ├── checkout.js # Razorpay + mockup sandbox payment flow
    │   │   ├── admin.js  # Administrative dashboard with CRUD tools
    │   │   └── contact.js# Contact form page
    │   └── styles/
    │       └── globals.css # Premium Vanilla CSS styling design system
    ├── package.json
    └── .env.local        # Frontend environment config
```

---

## 🎨 Core Design System & Theme

Lekya Specs operates on a premium luxury aesthetic theme:
*   **Palette:** Rich Black (`#0A0A0A` / `#121212`), Metallic Gold / Brass accents (`#C5A028`), and Warm White / Off-white backgrounds.
*   **Typography:** Elegant Serif headings paired with clean, minimalist Sans-Serif body copy (Inter/Outfit).
*   **Visual Highlights:** Glassmorphic navigation headers, smooth micro-interactions, dark premium background panels, and subtle gold border accents.

---

## 📚 Technical Stack Summary

*   **Frontend Framework:** Next.js (Pages router) + React
*   **Styling:** Vanilla CSS + TailwindCSS utility integration
*   **Backend Server:** Node.js + Express
*   **Database:** Turso Database (distributed LibSQL/SQLite)
*   **AI Engine:** face-api.js (TinyFaceDetector + FaceLandmark68) loaded from CDN client-side
*   **Payment Processor:** Razorpay (API integration + local sandbox simulator)
*   **Email Client:** Nodemailer via Google SMTP (Gmail App Passwords)

---

## ⚡ Active API Base URL Routing Rules

*   **Local Development:** Frontend runs on `http://localhost:3000`, Backend runs on `http://localhost:5000`. The frontend uses a dynamic `API_BASE` helper that resolves to `http://localhost:5000` when the hostname is `localhost` or `127.0.0.1`.
*   **Production Deployment:** Both services are hosted together in a single Vercel Services setup. Vercel routes `/api/*` requests directly to the backend service. Because they share the same origin on production, `API_BASE` resolves to `''` (relative path). This completely avoids CORS problems on production.
