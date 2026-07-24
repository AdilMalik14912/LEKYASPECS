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
*   `PARCEL_UNCLE_API_KEY` -> Production key (`pu_live_3a58bac546fddf0d9402569053b0f5e7da28915ac3822d8c`).
*   `WA_PHONE_NUMBER_ID` -> Meta WhatsApp Business Phone Number ID.
*   `WA_ACCESS_TOKEN` -> Meta WhatsApp Business Permanent Access Token.
*   `WA_WEBHOOK_VERIFY_TOKEN` -> Secret verification token for WhatsApp Webhook (e.g. `lekya_specs_webhook_2024`).

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
| **About Us & Ecosystem** | `https://lekyaspecs.vercel.app/about` |
| **Admin Panel** | `https://lekyaspecs.vercel.app/admin` |
| **Admin Live Map** | `https://lekyaspecs.vercel.app/admin-map` |
| **Seller Panel** | `https://lekyaspecs.vercel.app/seller` |
| **Delivery Panel** | `https://lekyaspecs.vercel.app/delivery` |
| **Delivery Route Map** | `https://lekyaspecs.vercel.app/delivery-map` |
| **HO Staff Panel** | `https://lekyaspecs.vercel.app/ho-staff` |
| **Team Chat** | `https://lekyaspecs.vercel.app/chat` |
| **Specs CRM Platform** | `https://lekyaspecs.vercel.app/crm` |
| **WhatsApp Business API Webhook** | `https://lekyaspecs.vercel.app/api/webhooks/whatsapp` |
| **Parcel Uncle Live Webhook** | `https://lekyaspecs.vercel.app/api/shipping/parcel-uncle/webhook` |
| **Printable Label PDF Endpoint** | `https://lekyaspecs.vercel.app/api/shipping/parcel-uncle/label/:waybill` |

> **Note:** Obsolete preview URLs like `lekyaspecs-800x4yrhk-lekya.vercel.app` are old preview deployments — always use the main production URL above.

---

## 📋 Recent Deployment History

| Date | Commit | What Was Deployed |
|------|--------|--------------------|
| 2026-07-24 | `df9c77b` | Fix Next.js static prerender TDZ `ReferenceError: Cannot access G before initialization` in `checkout.js`. |
| 2026-07-24 | `c163201` | Fix missing `Check` and `Sparkles` icon imports in `account.js` for Vercel compilation. |
| 2026-07-24 | `4ee649d` | Customer Self-Service Return, Exchange & Refund Hub in `/account` with Parcel Uncle reverse pickup integration. |
| 2026-07-24 | `9f5226c` | Segmented 6-box OTP entry UI, auto-advance, error shake animation & 3D celebratory confetti modal overlay. |
| 2026-07-24 | `d4871d1` | Meta WhatsApp Business Cloud API webhook & 9-intent auto-reply engine (`/api/webhooks/whatsapp`). |
| 2026-07-24 | `c49e129` | 3D CSS/SVG Glassmorphism animated SVG hero lookbook, right-side floating widgets with expandable WhatsApp menu, and 24-hr SpinWheel daily limit. |
| 2026-07-23 | `3766756` | Complete AI wording removal across 15+ pages, Tax Invoice HTML download & iframe print fix, HO staff & staff dashboard auth gate fixes. |


---

## 🗺️ Map Pages — Special Deployment Notes

- `delivery-map.js` and `admin-map.js` load **Leaflet.js** and **CartoDB tiles** from external CDNs at runtime — no npm install needed
- **Nominatim geocoding** (`nominatim.openstreetmap.org`) is called client-side — free, no API key required
- GPS location update endpoint `PUT /api/delivery/location` stores `rider_lat`, `rider_lng`, `rider_last_seen` in Turso DB
- Admin map polling: every **10 seconds** via `setInterval` — lightweight since it's just a DB query

