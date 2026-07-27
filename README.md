# Lekya Specs — Premium Luxury Eyewear Platform

> **🌐 Live at [lekya.in](https://lekya.in)**

A full-stack luxury eyewear e-commerce platform with live AR try-on, AI face shape analysis, multi-role dashboards, Parcel Uncle logistics, WhatsApp Business Cloud API, and a comprehensive team CRM.

Part of the **Lekya Group** corporate ecosystem:
👓 Lekya Specs · 🚚 Lekya Logistics · 📦 Parcel Uncle · ⚖️ Infinior Advisors · ☀️ Lekya Energy

---

## ✨ Key Features

- 👓 **3D Glassmorphism Lookbook** — Pure CSS/SVG animated spectacle visualizations
- 🤖 **AI Face Shape Detector** — face-api.js TinyFaceDetector + 68 landmark analysis
- 🥽 **Live AR Virtual Try-On** — Webcam overlay with 8 frame shapes & 10 colors
- 🛒 **Razorpay Checkout** — Prescription wizard, lens configurator, coupon codes
- 📦 **Parcel Uncle Logistics** — 1-Click dispatch, 4x6 PDF labels, NDR management, reverse pickup
- 💬 **WhatsApp Business Cloud API** — 9-intent auto-reply engine
- 🔄 **Self-Service Return & Exchange Hub** — Doorstep pickup integration
- 🏪 **Seller Panel** — Auto-assign, urgent orders, stale order alerts, agent leaderboard
- 🚚 **Delivery Panel & Route Map** — GPS tracking, delivery OTP, Leaflet.js route optimizer
- 🛡️ **Admin Panel** — Tax invoice generator, Razorpay refunds, DB optimizer, live webhook sandbox
- 💬 **Team Chat** — DMs, group channels, Cloudinary file uploads, emoji reactions, pinning
- 📈 **Specs CRM** — Kanban pipeline, lead scoring, AI email pitch generator, auto-sync
- 🎡 **Spin & Win Wheel** — 24-hour cooldown daily reward system
- 📍 **Live Admin Rider Map** — Real-time GPS tracking via Leaflet.js + CartoDB

---

## 🗂️ Project Structure

```
Specs/
├── .lekya-docs/          # Full project context documentation
│   ├── README.md         # System overview
│   ├── backend.md        # API endpoints, DB schema, webhooks
│   ├── frontend.md       # All pages, components, design system
│   └── deployment.md     # Vercel + GoDaddy DNS setup guide
├── backend/              # Node.js + Express API server
│   └── src/
│       ├── config/       # Turso DB, schema, seed
│       ├── controllers/  # 13 controller files
│       ├── middleware/   # JWT auth + role guards
│       └── utils/        # JWT, Mailer, SMS, WhatsApp, Parcel Uncle
├── frontend/             # Next.js storefront (Pages Router)
│   └── src/pages/        # 30+ pages
└── run-dev.ps1           # Windows dev runner script
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Turso](https://turso.tech) account
- [Cloudinary](https://cloudinary.com) account

### 1. Clone the repo
```bash
git clone https://github.com/AdilMalik14912/LEKYASPECS.git
cd LEKYASPECS
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Fill in your env vars
npm install
node src/app.js     # runs on :5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev         # runs on :3000
```

Or use the convenience script:
```powershell
.\run-dev.ps1
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (Pages Router) + React + Vanilla CSS |
| Styling | Dark Purple + Orange brand theme (`globals.css`) |
| Backend | Node.js + Express.js |
| Database | Turso (LibSQL / SQLite Cloud) |
| Auth | JWT + bcryptjs |
| Payments | Razorpay API + HMAC-SHA256 Webhooks |
| Logistics | Parcel Uncle Merchant API v1.0.3 |
| WhatsApp | Meta WhatsApp Business Cloud API v19.0 |
| Maps | Leaflet.js + CartoDB Dark Matter + Nominatim |
| Face AI | face-api.js (TinyFaceDetector + FaceLandmark68) |
| OTP/SMS | Fast2SMS Gateway + Nodemailer SMTP |
| Images | Cloudinary |
| Deploy | Vercel (frontend + backend) + GoDaddy (`lekya.in`) |

---

## 🌐 Live URLs

| Panel | URL |
|-------|-----|
| Main Store | https://lekya.in |
| Shop | https://lekya.in/shop |
| Virtual Try-On | https://lekya.in/tryon |
| Face Shape AI | https://lekya.in/face-shape |
| Lookbook | https://lekya.in/lookbook |
| Track Order | https://lekya.in/track |
| Admin Panel | https://lekya.in/admin |
| Seller Panel | https://lekya.in/seller |
| Delivery Panel | https://lekya.in/delivery |
| Team Chat | https://lekya.in/chat |
| CRM Platform | https://lekya.in/crm |

---

## 📄 License

MIT — Built with ❤️ by Adil Malik
