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
