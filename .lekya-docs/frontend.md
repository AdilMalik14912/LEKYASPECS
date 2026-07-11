# Frontend Core Documentation — Pages & Client Logic

The Lekya Specs frontend is built with Next.js using the Pages router. Global state is managed via React Contexts in [_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js).

**Last Updated:** 2026-07-11

---

## 🔑 Global State Management (Contexts)

[_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js) provides the following global contexts:

1. **AuthContext** — User login/logout, JWT token persistence in localStorage, profile updates.
2. **CartContext** — Cart items, quantity changes, stock limits, localStorage sync.
3. **WishlistContext** — Wishlist toggle & persistence.
4. **ToastContext** — Slide-up toast notifications for user actions.

> ⚠️ `seller.js` and `delivery.js` do NOT use `useToast` from `_app.js` — they have their own local toast state to avoid SSR crashes. This is by design.

### 🛡️ Staff Gateway Protection & Redirection Logic
- **Storefront Actions Lock:** If any staff/rider account tries to call `addToCart`, it is blocked with a validation toast: *"Staff/Rider accounts cannot purchase items."*
- **Clean Staff Header Layout:** If a user with role `admin`, `seller`, or `delivery` logs in and browses storefront pages (e.g. `/`), all client storefront components (Eyeglasses, Sunglasses, Lookbook, contact links, search bar, wishlist, and cart bag icons) are hidden from the header. Instead, a gorgeous, premium gold-bordered badge reading `🛡️ Staff Console Active` is displayed. On mobile view, a special redirect overlay panel is shown.
- **Storefront Auto-Redirect Guard:** A system-wide `useEffect` hook in `_app.js` detects if a staff/rider user lands on storefront routes (such as `/shop`, `/cart`, `/checkout`, `/wishlist`, `/compare`, `/customizer`, `/lens-guide`, `/ar-tryon`, `/tryon`, `/skin-analysis`, `/style-quiz`, and `/account`). It automatically intercepts their navigation and redirects them directly to their respective workspace dashboard (e.g. `/delivery` for riders, `/seller` for sellers, and `/admin` for administrators).
- **Independent Layout Isolation:** For all dedicated dashboard paths starting with `/admin`, `/seller`, or `/delivery` (including maps), the standard storefront header and footer are completely suppressed in `_app.js`, giving the dashboard UI 100% fullscreen real estate.

---

## 🖥️ All Application Pages

### 1. 🏠 Homepage ([index.js](file:///C:/Users/Admin/Specs/frontend/src/pages/index.js))
- Hero slider with CMS-configurable headlines.
- Discovery grid: Face Shape Detector, Bespoke Customizer, Try-On Lab.
- Smart Recommendations based on saved face shape profile.
- Recently Viewed product strip.

### 2. 🛍️ Shop Catalog ([shop.js](file:///C:/Users/Admin/Specs/frontend/src/pages/shop.js))
- Filters: category, gender, frame_shape, search query.
- Sorting: price low→high, high→low, alphabetic.
- Quick View modal for fast product inspection.
- **Product Comparison Tray** — floating sticky tray allowing comparison of up to 3 frames simultaneously.

### 3. 🤖 AI Face Shape Detector ([face-shape.js](file:///C:/Users/Admin/Specs/frontend/src/pages/face-shape.js))
- `TinyFaceDetector` + `FaceLandmark68Net` loaded from jsDelivr CDN.
- Detects 68 landmark points, calculates face ratios → oval/round/square/heart/diamond.
- Saves shape to user profile via `/api/auth/profile`.

### 4. 🥽 Virtual Try-On Studio ([tryon.js](file:///C:/Users/Admin/Specs/frontend/src/pages/tryon.js))
- **Smart BG Removal**: Canvas `getImageData()` pixel engine strips white/grey backgrounds from catalog product images.
- **Live Webcam Mode**: `getUserMedia()` webcam stream with real-time glasses overlay.
- **Mirror Mode**: Toggle CSS `scaleX(-1)` on preview for a realistic mirror experience.
- **Before/After Split View**: Drag-to-compare divider.
- **8 SVG Frame Shapes**: Wayfarer, Round, Aviator, Cat-Eye, Rectangle, Hexagonal, Rimless, Browline.
- **10 Frame Colors** with live color dot picker.
- **AI Auto-Fit**: face-api.js aligns glasses to eye landmarks automatically.
- **Save PNG**: Canvas compositing exports face + transparent glasses as downloadable PNG.

### 5. 🎨 Skin Tone AI Lab ([skin-analysis.js](file:///C:/Users/Admin/Specs/frontend/src/pages/skin-analysis.js))
- Canvas `getImageData()` pixel sampling from facial zones.
- Fitzpatrick Scale (I-VI) + undertone (warm/cool/neutral) classification.
- Frame color + lens color recommendations.

### 6. 🛠️ Bespoke Customizer ([customizer.js](file:///C:/Users/Admin/Specs/frontend/src/pages/customizer.js))
- SVG-based frame rendering with sliders for size, opacity, color, monogram.

### 7. 💳 Checkout & Razorpay ([checkout.js](file:///C:/Users/Admin/Specs/frontend/src/pages/checkout.js))
- Razorpay Checkout window integration.
- Mock sandbox fallback simulator for testing.
- **Prescription Intake Wizard** — SPH, CYL, Axis, PD fields + lens index (1.56–1.74) + coatings.
- **Coupon Code Input** — validates via `/api/coupons/validate` and applies discount live.

### 8. 👓 AI Prescription Lens Studio ([lens-guide.js](file:///C:/Users/Admin/Specs/frontend/src/pages/lens-guide.js))
- Canvas-based vision distortion engine simulating lens refraction.
- Multi-index (1.56–1.74) edge thickness silhouette visualizer.
- Interactive coating toggles: Anti-Reflective, Blue Light, Photochromic.

### 9. 🔍 Product Detail Page ([product/[id].js](file:///C:/Users/Admin/Specs/frontend/src/pages/product/[id].js))
- Product specs, image gallery, reviews, face-shape match indicator.
- Related products (same category).
- Recently Viewed tracker in localStorage.
- **Prescription Lens Configurator** — full lens selector with live dynamic price update.

### 10. 👤 Account Dashboard ([account.js](file:///C:/Users/Admin/Specs/frontend/src/pages/account.js))
- Profile info, face shape, edit modal, and Dual Phone/Email login & registration with 6-digit OTP verification.
- Order history with status badges.
- **Specs Rewards Club** — displays loyalty points balance, tier (Bronze/Silver/Gold), and referral link copy button.
- **Order Tracking Notes** — shows admin-added dispatch notes per order.
- **AI Face Scanner** — simulates face shape scan and saves result to profile.

### 11. 🛡️ Admin Panel ([admin.js](file:///C:/Users/Admin/Specs/frontend/src/pages/admin.js))
Access: `/admin` — only users with `role: admin` or email `dev.parceluncle@gmail.com` can enter.

**Sidebar Tabs & Features:**

| Tab | Feature |
|-----|---------|
| Dashboard | Sales analytics, revenue chart, low stock alerts, recent activity log |
| Customer Orders | List orders, update status, add dispatch/tracking notes, and directly assign/re-assign delivery riders (agents) |
| Product Catalog | Add / Edit / Delete eyewear products with images |
| View Customers | List all customers; click to Inspect Profile (order history overlay & Edit Credentials form) |
| Promotions | Create, toggle, delete coupon codes (% or fixed amount) |
| Broadcast Email | Send personalized bulk or targeted email using 7 pre-styled luxury HTML templates |
| Settings CMS | Update hero banner, headline text, background images |
| Admin Roles | Create new sub-admins, view admin list, demote admins |
| Support Helpdesk | View contact form messages, reply via email directly |
| DB Optimizer | See DB latency, table row counts, run VACUUM optimization |
| Export Data | Download orders or customers as CSV |
| Live User Monitor | Real-time active sessions across devices |
| Team Management | Change user roles (user/seller/delivery/admin) |
| 🛰 Live Rider Map | Opens `/admin-map` — real-time GPS tracking of all delivery agents |

### 12. 🛰 Admin Live Rider Map ([admin-map.js](file:///C:/Users/Admin/Specs/frontend/src/pages/admin-map.js)) ← NEW (2026-07-10)
Access: `/admin-map` — Admin only. Linked from Admin sidebar "🛰 Live Rider Map".

**Features:**
- **Full-screen dark map** — CartoDB Dark Matter tiles via Leaflet.js
- **All riders shown** — truck 🚚 markers, each rider gets a unique color
- **Online/Idle/Offline detection** — Green dot (< 5min), Yellow (< 30min), Grey (offline)
- **Order delivery pins** — 📦 markers for each rider's active order destinations
- **Dashed route lines** — connects rider to their order pins
- **Left sidebar panel** — rider cards with stats; click to zoom map to that rider
- **Auto-refresh** — polls `/api/admin/riders/live-map` every 10 seconds
- **Map legend** — icon explanations at bottom right
- Uses Nominatim (OpenStreetMap free geocoding) to convert addresses to coordinates

### 13. 🏪 Seller Panel ([seller.js](file:///C:/Users/Admin/Specs/frontend/src/pages/seller.js)) ← NEW (2026-07-10)
Access: `/seller` — users with `role: seller` or `role: admin`. Protected by `isSeller` middleware.

**Tabs & Features:**

| Tab | Feature |
|-----|---------|
| Dashboard | Stats cards (orders, revenue, products, agents), Low stock alerts, Recent orders, 🔔 Stale orders alert (red panel for unassigned paid orders > 1hr), 🏆 Agent Performance Leaderboard |
| Orders | Filter by status/search, 🤖 Auto-assign to least-busy agent, ⚡ Mark urgent/express with reason note, View all order details + manage modal |
| Inventory | Product list with stock levels, edit products |
| Delivery Agents | List of agents with assigned order counts |

**Special UI in Orders Tab:**
- **Agent Workloads button** → Opens modal showing each agent's: active orders, total delivered, success rate % with color bar
- **🤖 Auto-assign** — on any unassigned order row
- **⚡ Urgent toggle** — on every order row; prompts for reason, marks order red

### 14. 🚚 Delivery Agent Panel ([delivery.js](file:///C:/Users/Admin/Specs/frontend/src/pages/delivery.js)) ← NEW (2026-07-10)
Access: `/delivery` — users with `role: delivery` or `role: admin`. Protected by `isDelivery` middleware.

**Tabs & Features:**

| Tab | Feature |
|-----|---------|
| Dashboard | Agent stats: total assigned, delivered today, out for delivery, shipped |
| My Deliveries | All assigned orders; status progress stepper (Processing → Shipped → Out for Delivery → Delivered); call customer button; full address display |
| Available Orders | Unassigned paid orders **grouped by city** 📍; urgent orders shown with red glow + animated badge; "Claim Order" or "Claim URGENT" button |

**Header Button:** "🗺 Route Map" → opens `/delivery-map`

### 15. 🗺 Delivery Route Map ([delivery-map.js](file:///C:/Users/Admin/Specs/frontend/src/pages/delivery-map.js)) ← NEW (2026-07-10)
Access: `/delivery-map` — Delivery agents only. Linked from Delivery Panel header.

**Features:**
- **Full-screen dark map** — CartoDB Dark Matter tiles via Leaflet.js
- **Live GPS tracking** — `navigator.geolocation.watchPosition()` + sends to backend every 30s
- **GPS Live badge** — green pulsing indicator if location permission granted
- **Animated truck marker** — pulsing blue glow circle around rider's position
- **Numbered order stops** — circular numbered markers, color-coded by status
- **⚡ Urgent badge** — red glowing badge on urgent order markers + animated pulse
- **Route polyline** — dashed amber line: rider → stop1 → stop2 → ...
- **Stats bar** — Stops count, total km, estimated time (at 30km/h avg), urgent count
- **Order card strip** — horizontal scroll; click card → jumps map to that order
- **Geocoding progress bar** — shows progress while converting addresses to coordinates
- **"Open in Google Maps"** → generates Google Maps URL with all waypoints for turn-by-turn navigation
- **"📍" button** → centers map back to rider's current location
- Uses Nominatim (free OSM geocoder) with 1.1s delay between requests to respect rate limits

### 16. 🎨 Brand Stylist Hub ([stylist.js](file:///C:/Users/Admin/Specs/frontend/src/pages/stylist.js))
Access: `/stylist` — A panel separate from operations for creative brand directors.

**Modules:** Lookbook Builder, Face Shape Advisor, Spotlight Manager, Style Tag Editor, Color Story Board, Product Photo Hub, Content Calendar, Review Spotlight, Comparison Matrix, Brand Voice Checker, Sandbox Preview.

### 17. 🛡️ Privacy Policy ([privacy.js](file:///C:/Users/Admin/Specs/frontend/src/pages/privacy.js))
Comprehensive disclosures: biometric processing, browser storage, encryption, third-party PCI, data deletion controls.

### 18. ⚖️ Terms of Service ([terms.js](file:///C:/Users/Admin/Specs/frontend/src/pages/terms.js))
Store guidelines, authentication requirements, prescription eyewear specs, return limits, loyalty redemption metrics.

### 19. 🗺️ Sitemap Directory ([sitemap.js](file:///C:/Users/Admin/Specs/frontend/src/pages/sitemap.js))
Visual sitemap index page categorizing all routes.

---

## 🎨 Design System

- **Theme:** Rich Black (`#0A0A0A` / `#121212`) + Metallic Gold (`#C5A028`) + Off-white
- **Typography:** Inter / Outfit (Google Fonts)
- **Effects:** Glassmorphism nav, smooth micro-animations, gold borders, dark premium panels
- **Styling:** Vanilla CSS in `globals.css` — no Tailwind
- **Map pages:** Use inline styles (not global CSS) + Leaflet.js

---

## ⚠️ Important Development Notes

### Import Rules
- All pages use `const React = require('react')` (CommonJS) — **do NOT use ES module `import` syntax**
- lucide-react icons must all be included in the single destructured `require('lucide-react')` call
- Missing icon imports will silently fail — always verify before adding new modals

### Toast System
- `seller.js` and `delivery.js` have their own **local toast state** — they do NOT use `useToast` from `_app.js`
- This is because `useToast` caused SSR crashes on these pages
- Local toast pattern:
  ```js
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };
  ```

### Map Pages
- `delivery-map.js` and `admin-map.js` load Leaflet.js via script injection in `useEffect` — this avoids SSR issues
- Nominatim geocoder is rate-limited to 1 request/second — always add `setTimeout(r => r, 1100)` between calls
- CartoDB Dark Matter tile URL: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

### Role Guards
- `seller.js` and `delivery.js` check `user.role` in `useEffect` and redirect to `/account` if unauthorized
- Always check both `user.role` AND `user.email === 'admin@specs.com'` for admin bypass

---

## 🔗 Direct Panel Links (Production)

| Panel | URL |
|-------|-----|
| Homepage | `https://lekyaspecs.vercel.app/` |
| Shop | `https://lekyaspecs.vercel.app/shop` |
| Account / Login | `https://lekyaspecs.vercel.app/account` |
| Admin Panel | `https://lekyaspecs.vercel.app/admin` |
| Admin Live Map | `https://lekyaspecs.vercel.app/admin-map` |
| Seller Panel | `https://lekyaspecs.vercel.app/seller` |
| Delivery Panel | `https://lekyaspecs.vercel.app/delivery` |
| Delivery Route Map | `https://lekyaspecs.vercel.app/delivery-map` |
| Virtual Try-On | `https://lekyaspecs.vercel.app/tryon` |
| Face Shape AI | `https://lekyaspecs.vercel.app/face-shape` |
| Brand Stylist Hub | `https://lekyaspecs.vercel.app/stylist` |
