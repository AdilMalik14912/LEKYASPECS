# LEKYA SPECS (lekya.in) — Complete Project Architecture & Master Documentation

> **Last Updated**: July 27, 2026  
> **Production Domain**: [https://lekya.in](https://lekya.in)  
> **GitHub Repository**: `AdilMalik14912/LEKYASPECS` (Branch: `main`)  
> **Parent Ecosystem**: Lekya Group (Lekya Specs, Lekya Energy, Lekya Vision, Lekya Health, Lekya Media)

---

## 🏛️ 1. Brand Ecosystem & Design System

### A. Design Aesthetics & Visual Identity
- **Primary Color Palette**:
  - Deep Midnight Purple: `#0D0016` (Background & Primary Containers)
  - Regal Dark Violet: `#1A0024` (Card Overlays & Glass Panels)
  - Warm Luxury Gold: `#FAAE62` & `#D4893F` (Accents, CTAs, Highlights)
  - Soft Cream / Off-White: `#FEF6EE` (Body Text & Titles)
  - Muted Lavender: `#9B7EA8` & `#D4C8DC` (Subtitles & Captions)
- **Glassmorphism Aesthetic**:
  - `liquid-glass` CSS class providing backdrop blur (`backdrop-blur-xl`), subtle white border borders (`border-white/15`), and soft ambient glow orbs.
- **Logo Symbol**:
  - Vision Eye Logo (`VisionEyeLogo.js`) — Animated geometric spectacles icon with infinity curvature and gold accents.

---

## 💻 2. Frontend Architecture (Next.js 14)

### Key Page Routes & Responsibilities

1. **[`src/pages/_app.js`](file:///c:/Users/Admin/Specs/frontend/src/pages/_app.js)**:
   - Global App Wrapper containing AuthContext, CartContext, WishlistContext, and ToastContext.
   - Glassmorphic navigation header with dynamic submenus:
     - **Collections Dropdown**: Prescription Glasses, Polarized Sunglasses, Blue Shield, Beta Titanium, Custom Lens.
     - **Group Companies Dropdown**: Lekya Group Overview, Lekya Specs, Lekya Energy, Lekya Health, Lekya Media.
     - **Quick Tools**: 2D Virtual Try-On, AI Face Shape Matcher, Style Quiz, Track Order, VIP Journal.
   - **Structured 4-Column Luxury Footer**:
     - Col 1: Brand Vision, Vision Eye Logo, Beta Titanium tags.
     - Col 2: Collections & Tools (2D Try-On Studio, Style Lookbook).
     - Col 3: Optical Journal, About Us, My Profile, Track Order Status.
     - Col 4: Corporate HQ (South Delhi office, `support@lekyaspecs.in`, `+91 96541 19262`).
     - Copyright: `© 2026 lekya.in — Lekya Specs Eyewear`.
   - **Google SEO & Sitelinks Schema**:
     - Embedded `Organization`, `WebSite` (Sitelinks Searchbox), and `SiteNavigationElement` (6 Sitelinks: About Us, Shop, 2D Try-On, Blog, Track Order, Contact) JSON-LD structured data.

2. **[`src/pages/index.js`](file:///c:/Users/Admin/Specs/frontend/src/pages/index.js)**:
   - Full-screen HLS streaming video background.
   - Bottom-left positioned Hero headline and CTA.
   - Smooth scroll-driven sections without duplicating optical glasses cards.

3. **[`src/pages/shop.js`](file:///c:/Users/Admin/Specs/frontend/src/pages/shop.js)**:
   - Full catalog with category filters (Eyeglasses, Sunglasses, Screen Glasses, Titanium Series), gender filter (Men, Women, Unisex), face shape matcher, and fast live search.

4. **[`src/pages/product/[id].js`](file:///c:/Users/Admin/Specs/frontend/src/pages/product/%5Bid%5D.js)**:
   - 360° interactive frame rotator (`Product360Viewer.js`).
   - Verified Buyer Badges (`✓ Verified Buyer`) and frame fit tags (`Fit: True to Size`).
   - Interactive Restock Notification button (`🔔 Notify Me When Restocked`) for sold-out items.
   - Embedded `Product`, `Offer`, `AggregateRating`, and `Brand` JSON-LD Schema for Google Rich Search Snippets (Star rating + Price display in Google).

5. **[`src/pages/tryon.js`](file:///c:/Users/Admin/Specs/frontend/src/pages/tryon.js)**:
   - Interactive 2D Virtual Try-On Studio with live webcam overlay, frame scaling, rotation, color picker, and background removal tool.

6. **[`src/pages/blog.js`](file:///c:/Users/Admin/Specs/frontend/src/pages/blog.js)** & **[`src/pages/blog/[slug].js`](file:///c:/Users/Admin/Specs/frontend/src/pages/blog/%5Bslug%5D.js)**:
   - Optical & Corporate Journal featuring 7 live articles:
     1. *The 2026 Eyewear Guide: How to Choose Frames Matched to Your Face Shape* (Optical Guide)
     2. *The Lekya Group Vision: Pioneering Healthcare, Solar Energy, Eyewear & Media Innovation* (Group Companies)
     3. *Behind the Frames: Meet the Master Craftsmen, Optometrists & Design Engineers of Lekya Specs* (Lekya Team)
     4. *Blue Light Shield vs. Anti-Reflective Coating: What Your Eyes Actually Need* (Lens Tech)
     5. *Titanium vs. Japanese Acetate: The Ultimate Frame Material Showdown* (Material Science)
     6. *UV400 vs. Polarized Lenses: Protect Your Eyes From Glare & Sun Damage* (Eye Care)
     7. *How to Read Your Eye Prescription: Decoding SPH, CYL, AXIS & Pupillary Distance* (Prescription Tips)
   - Article pages include `BlogPosting` JSON-LD Schema for Google Discover indexing.

7. **[`src/pages/admin.js`](file:///c:/Users/Admin/Specs/frontend/src/pages/admin.js)**:
   - Comprehensive Admin Console featuring:
     - Analytics & Sales Overview.
     - Product Catalog CRUD & Inventory Control.
     - Orders & Logistics Management (Parcel Uncle API integration).
     - **Manage Blogs & Articles Manager**: Create new articles, toggle featured status, filter by category, and delete stories.
     - Customer Accounts & VIP User Roles.
     - Regional Store Map & Fleet Operations.

8. **[`src/pages/checkout.js`](file:///c:/Users/Admin/Specs/frontend/src/pages/checkout.js)**:
   - Seamless checkout pipeline.
   - On order submission: clears cart, generates order reference (`LS-XXXXXX`), and instantly redirects the user to `/account?order_success=true` with zero error popups.

9. **[`src/pages/track.js`](file:///c:/Users/Admin/Specs/frontend/src/pages/track.js)**:
   - Real-time Parcel Uncle shipping tracker with live status updates (Order Placed -> Optical Assembly -> Quality Inspection -> In Transit -> Delivered).

---

## 🛠️ 3. Backend Architecture (Node.js & Express API)

### Middleware & Security Shield ([`backend/src/app.js`](file:///c:/Users/Admin/Specs/backend/src/app.js) & [`security.js`](file:///c:/Users/Admin/Specs/backend/src/middleware/security.js))
- **Enterprise Security Headers**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(self)`
- **Rate Limiting**:
  - Memory-based rate limiter: 15 req/min on sensitive auth/contact routes, 100 req/min general.
- **Bot Scraper Shield**:
  - User-Agent blocker rejecting headless crawlers and command line bots (`curl`, `python-requests`, `headlesschrome`).
- **Database Maintenance**:
  - Auto-cleanup of expired OTPs and stale sessions.
  - Serverless non-fatal database initialization (`initDb()`).

---

## 🔍 4. Technical SEO & Indexing Setup

1. **[`public/sitemap.xml`](file:///c:/Users/Admin/Specs/frontend/public/sitemap.xml)**:
   - Canonical sitemap listing main routes with daily/weekly change frequencies for Google Sitelinks.
2. **[`public/robots.txt`](file:///c:/Users/Admin/Specs/frontend/public/robots.txt)**:
   - Directives allowing Googlebot & Bingbot to index public pages while protecting `/admin` and `/api`.
3. **[`scripts/ping-search-engines.js`](file:///c:/Users/Admin/Specs/frontend/scripts/ping-search-engines.js)**:
   - Search engine index ping script submitting `https://lekya.in/sitemap.xml` directly to Google & Bing.

---

## 📝 5. Quick Reference Commands

- **Git Branch**: `main`
- **Deploy Trigger**: Push to `origin main` automatically triggers Vercel Production Build.
- **Vercel Build Command**: `npm run build`
