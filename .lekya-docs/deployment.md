# Deployment Documentation — Vercel Setup & Environment Config

Lekya Specs is deployed on **Vercel** as a single project using Vercel's **Multi-Project / Services** deployment model.

---

## ⚙️ Vercel Services Configuration ([vercel.json](file:///C:/Users/Admin/Specs/vercel.json))

The [vercel.json](file:///C:/Users/Admin/Specs/vercel.json) at the root of the project directs the build process:

```json
{
  "services": {
    "frontend": {
      "root": "frontend",
      "framework": "nextjs"
    },
    "backend": {
      "root": "backend",
      "entrypoint": "src/app.js"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": {
        "type": "service",
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "type": "service",
        "service": "frontend"
      }
    }
  ]
}
```

### Routing and Behavior:
1.  **Frontend Service:** Deploys the Next.js app in the `frontend` folder.
2.  **Backend Service:** Deploys the Express app in the `backend` folder, with `src/app.js` as the server entry point runtime handler.
3.  **Rewrites:** Routes all traffic matching `/api/*` directly to the Express backend service. All other traffic is directed to the Next.js frontend pages.

---

## 🔑 Environment Variables Setup

Ensure the following variables are configured under your **Vercel Project Settings → Environment Variables**:

### Backend Environment Variables
*   `TURSO_URL` -> Turso connection URL (e.g. `libsql://your-db.turso.io`).
*   `TURSO_TOKEN` -> Turso authentication auth token.
*   `JWT_SECRET` -> Secure secret key for signing user auth tokens.
*   `SMTP_EMAIL` -> Gmail address for mailing (e.g. `am8386757@gmail.com`).
*   `SMTP_PASSWORD` -> Gmail App Password (16 characters, e.g. `fbceuzlrcumeejjb`).
*   `CLOUDINARY_URL` -> URL for Cloudinary image uploads storage.
*   `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` -> Razorpay credentials.

---

## 📈 Auto-Deployment via Git Pushes
The Vercel project is linked to the GitHub repository **`AdilMalik14912/LEKYASPECS`**.
Whenever commits are pushed to the `main` branch:
1.  Vercel automatically triggers a build.
2.  If the build compiles successfully, the new version goes live on production instantly.
3.  If a build error occurs, Vercel keeps the previous version running so the live store remains active.

---

## 🌐 Live URLs (Production)

| Service | URL |
|---------|-----|
| **Main Store** | `https://lekyaspecs.vercel.app` |
| **About Us & Ecosystem** | `https://lekyaspecs.vercel.app/about` ← NEW (2026-07-16) |
| **Admin Panel** | `https://lekyaspecs.vercel.app/admin` |
| **Admin Live Map** | `https://lekyaspecs.vercel.app/admin-map` |
| **Seller Panel** | `https://lekyaspecs.vercel.app/seller` |
| **Delivery Panel** | `https://lekyaspecs.vercel.app/delivery` |
| **Delivery Route Map** | `https://lekyaspecs.vercel.app/delivery-map` |
| **HO Staff Panel** | `https://lekyaspecs.vercel.app/ho-staff` ← NEW (2026-07-16) |
| **Team Chat** | `https://lekyaspecs.vercel.app/chat` |
| **Specs CRM Platform** | `https://lekyaspecs.vercel.app/crm` |

> **Note:** Obsolete preview URLs like `lekyaspecs-800x4yrhk-lekya.vercel.app` are old preview deployments — always use the main production URL above.

---

## 📋 Recent Deployment History

| Date | Commit | What Was Deployed |
|------|--------|--------------------|
| 2026-07-04 | Initial | Base platform: shop, checkout, account, admin |
| 2026-07-05 | Feature batch | Try-On, Face AI, Skin AI, Prescription, Stylist Hub |
| 2026-07-10 | `870d619` | Seller panel, delivery panel, RBAC, 6 smart rider features (auto-assign, urgent, workload, leaderboard, stale alerts, city grouping) |
| 2026-07-10 | `b1ba736` | Real-time map system: delivery-map.js + admin-map.js + GPS backend endpoints |
| 2026-07-13 | `eea7a57` | HO Staff Panel, Enterprise CRM Platform, Order Tracking timeline, Voice Recording in Team Chat |
| 2026-07-14 | `44bb855` | Chat Fixes: file download MIME extension fixes, sender deletion constraints, emoji picker UI fixes |
| 2026-07-16 | `760583e` | fix(chat): force raw resource type on Cloudinary for PDF files to fix 401 ACL/delivery block |
| 2026-07-16 | `1259d7d` | About Us & Group Companies Ecosystem page (`/about`), Lekya Group Navbar Dropdown (`_app.js`), Razorpay HMAC Webhook, Fast2SMS OTP Gateway |
| 2026-07-17 | `3766756` | Complete AI wording removal across 15+ pages, Tax Invoice HTML download & iframe print fix, HO staff & staff dashboard auth gate fixes |

---

## 🗺️ Map Pages — Special Deployment Notes

- `delivery-map.js` and `admin-map.js` load **Leaflet.js** and **CartoDB tiles** from external CDNs at runtime — no npm install needed
- **Nominatim geocoding** (`nominatim.openstreetmap.org`) is called client-side — free, no API key required
- GPS location update endpoint `PUT /api/delivery/location` stores `rider_lat`, `rider_lng`, `rider_last_seen` in Turso DB
- Admin map polling: every **10 seconds** via `setInterval` — lightweight since it's just a DB query

