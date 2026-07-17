# Frontend Core Documentation — Pages & Client Logic

The Lekya Specs frontend is built with Next.js using the Pages router. Global state is managed via React Contexts in [_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js).

# Frontend Core Documentation — Pages & Client Logic

The Lekya Specs frontend is built with Next.js using the Pages router. Global state is managed via React Contexts in [_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js).

**Last Updated:** 2026-07-17

---

## 🔑 Global State Management (Contexts)

[_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js) provides the following global contexts:

1. **AuthContext** — User login/logout, JWT token persistence in localStorage, profile updates.
2. **CartContext** — Cart items, quantity changes, stock limits, localStorage sync.
3. **WishlistContext** — Wishlist toggle & persistence.
4. **ToastContext** — Slide-up toast notifications for user actions.

> ⚠️ `seller.js` and `delivery.js` do NOT use `useToast` from `_app.js` — they have their own local toast state to avoid SSR crashes. This is by design.

### 🏢 Header Navigation & Group Companies Dropdown
- **Header Dropdown**: Visual Lekya Group dropdown featuring all 5 corporate entities:
  - 👓 **Lekya Specs** (`/shop` - Luxury Retail)
  - 🚚 **Lekya Logistics** (`lekyalogistics.com` - Pan-India Freight)
  - 📦 **Parcel Uncle** (`parceluncle.com` - Hyperlocal Courier)
  - ⚖️ **Infinior Advisors** (`infinioradvisors.com` - Corporate Advisory)
  - ☀️ **Lekya Energy** (`lekyaenergy.com` - Clean Solar Energy highlight card)

### 🛡️ Staff Gateway Protection & Redirection Logic
- **Storefront Actions Lock:** If any staff/rider account tries to call `addToCart`, it is blocked with a validation toast: *"Staff/Rider accounts cannot purchase items."*
- **Clean Staff Header Layout:** If a user with role `admin`, `seller`, `delivery`, or `ho_staff` logs in and browses storefront pages (e.g. `/`), all client storefront components (Eyeglasses, Sunglasses, Lookbook, contact links, search bar, wishlist, and cart bag icons) are hidden from the header. Instead, a gold-bordered badge reading `🛡️ Staff Console Active` is displayed.
- **Storefront Auto-Redirect Guard:** A system-wide `useEffect` hook in `_app.js` detects if a staff/rider user lands on storefront routes. It automatically intercepts their navigation and redirects them directly to their respective workspace dashboard.
- **Auth Loading Protection:** Dashboard pages (`ho-staff.js`, `seller.js`, `delivery.js`, `crm.js`, `admin.js`) wait for `authLoading` to finish before checking user role guards, preventing premature redirects to `/account` during page loads or refreshes.

---

## 🖥️ All Application Pages

### 1. 🏠 Homepage ([index.js](file:///C:/Users/Admin/Specs/frontend/src/pages/index.js))
- Hero slider with CMS-configurable headlines.
- Precision tools grid: Face Shape Analyzer, Bespoke Customizer, Virtual Try-On Studio.
- Precision Curation recommendations based on saved face shape profile.
- Group Companies Ecosystem showcase banner with active links (`lekyaenergy.com`, etc.).

### 2. 📖 About Us & Group Ecosystem ([about.js](file:///C:/Users/Admin/Specs/frontend/src/pages/about.js)) ← NEW (2026-07-16)
- Corporate vision, heritage, and values grid.
- Key metrics: 5 Group Entities, 2M+ Customers, 150MW Solar, 28+ States.
- Detailed showcases for **Lekya Specs**, **Lekya Logistics**, **Parcel Uncle**, **Infinior Advisors**, and **Lekya Energy**.

### 3. 🛍️ Shop Catalog ([shop.js](file:///C:/Users/Admin/Specs/frontend/src/pages/shop.js))
- Filters: category, gender, frame_shape, search query.
- Sorting: price low→high, high→low, alphabetic.
- Quick View modal for fast product inspection.
- **Product Comparison Tray** — floating sticky tray allowing comparison of up to 3 frames simultaneously.

### 4. 🤳 Face Shape Analyzer ([face-shape.js](file:///C:/Users/Admin/Specs/frontend/src/pages/face-shape.js))
- `TinyFaceDetector` + `FaceLandmark68Net` loaded from jsDelivr CDN.
- Detects 68 landmark points, calculates face ratios → oval/round/square/heart/diamond.
- Saves shape to user profile via `/api/auth/profile`.

### 5. 🥽 Virtual Try-On Studio ([tryon.js](file:///C:/Users/Admin/Specs/frontend/src/pages/tryon.js))
- **Precision BG Removal**: Canvas `getImageData()` pixel engine strips white/grey backgrounds from catalog product images.
- **Live Webcam Mode**: `getUserMedia()` webcam stream with real-time glasses overlay and Live Tracking badge.
- **Mirror Mode**: Toggle CSS `scaleX(-1)` on preview for a realistic mirror experience.
- **Before/After Split View**: Drag-to-compare divider.
- **8 SVG Frame Shapes**: Wayfarer, Round, Aviator, Cat-Eye, Rectangle, Hexagonal, Rimless, Browline.
- **10 Frame Colors** with live color dot picker.
- **Precision Auto-Fit**: face-api.js aligns glasses to eye landmarks automatically.
- **Save PNG**: Canvas compositing exports face + transparent glasses as downloadable PNG.

### 6. 🎨 Skin Tone Studio ([skin-analysis.js](file:///C:/Users/Admin/Specs/frontend/src/pages/skin-analysis.js))
- Canvas `getImageData()` pixel sampling from facial zones.
- Fitzpatrick Scale (I-VI) + undertone (warm/cool/neutral) classification.
- Frame color + lens color recommendations.

### 7. 🛠️ Bespoke Customizer ([customizer.js](file:///C:/Users/Admin/Specs/frontend/src/pages/customizer.js))
- SVG-based frame rendering with sliders for size, opacity, color, monogram.

### 8. 💳 Checkout & Razorpay ([checkout.js](file:///C:/Users/Admin/Specs/frontend/src/pages/checkout.js))
- Razorpay Checkout window integration.
- Mock sandbox fallback simulator for testing.
- **Prescription Intake Wizard** — SPH, CYL, Axis, PD fields + lens index (1.56–1.74) + coatings.
- **Coupon Code Input** — validates via `/api/coupons/validate` and applies discount live.

### 9. 👓 Optical Refraction Lab ([lens-guide.js](file:///C:/Users/Admin/Specs/frontend/src/pages/lens-guide.js))
- Canvas-based vision distortion engine simulating lens refraction.
- Multi-index (1.56–1.74) edge thickness silhouette visualizer.
- Interactive coating toggles: Anti-Reflective, Blue Light, Photochromic.

### 10. 🔍 Product Detail Page ([product/[id].js](file:///C:/Users/Admin/Specs/frontend/src/pages/product/[id].js))
- Product specs, image gallery, reviews, face-shape match indicator.
- Related products (same category).
- Recently Viewed tracker in localStorage.
- **Prescription Lens Configurator** — full lens selector with live dynamic price update.

### 11. 👤 Account Dashboard ([account.js](file:///C:/Users/Admin/Specs/frontend/src/pages/account.js))
- Profile info, face shape, edit modal, and Dual Phone/Email login & registration with 6-digit OTP verification.
- Order history with status badges.
- **Download Tax Invoice** — direct one-click button generating standalone `.html` tax invoice files (`LekyaSpecs_Invoice_INV-000XXX.html`).
- **Specs Rewards Club** — displays loyalty points balance, tier (Bronze/Silver/Gold), and referral link copy button.
- **Order Tracking Notes** — shows admin-added dispatch notes per order.

### 12. 🏢 HO Staff Hub ([ho-staff.js](file:///C:/Users/Admin/Specs/frontend/src/pages/ho-staff.js)) ← NEW (2026-07-16)
Access: `/ho-staff` — HO staff and Admin accounts.
- **EOD Work Reporting**: Submit completed tasks, pending tasks, and operational issues.
- **Report History**: View past submitted EOD reports with date timestamps.
- **Team Chat Integration**: Direct launcher for `/chat`.
- **Profile Management**: Update staff name, phone, password, and avatar.

### 13. 🛡️ Admin Panel ([admin.js](file:///C:/Users/Admin/Specs/frontend/src/pages/admin.js))
Access: `/admin` — only users with `role: admin` or email `dev.parceluncle@gmail.com` can enter.

**Key Features:**
- **Standalone Tax Invoice HTML Generator & Printer**: Generates downloadable `.html` invoices and direct iframe `@media print` printing.
- **Instant Razorpay Refunds**: Refund API integration for cancelled orders.
- **All Core Operations**: Orders, inventory, customer inspection, email broadcasts, CMS settings, team management, DB optimizer.

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

**Header Buttons:** "💬 Chat" → opens `/chat` (Team Chat), "🗺 Route Map" → opens `/delivery-map`. ← Chat button NEW (2026-07-13)

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
- **"⚡ Simulate GPS"** → animates location marker step-by-step along the route path, sending coordinate updates to the backend so the Admin Panel receives real-time tracking updates
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

### 21. 💬 Team Chat ([chat.js](file:///C:/Users/Admin/Specs/frontend/src/pages/chat.js)) ← NEW (2026-07-13)
Access: `/chat` — staff roles only (admin, seller, delivery, stylist). Regular customers are auto-redirected.

**Features:**
- **3-column layout**: Left sidebar (conversations), Center (messages), Right (members/pinned/files panel)
- **Direct Messages (DMs)**: Start 1-on-1 chats with any team member
- **Group Channels**: Create named groups with description + multiple members
- **File Uploads**: Images (thumbnail preview), PDFs, docs, ZIP (max 10MB) — stored on Cloudinary
- **Emoji Reactions**: 20 quick-react emojis per message
- **Message Pinning**: Pin/unpin messages — listed in Pinned panel
- **Reply Threading**: Reply to any specific message with inline preview
- **Message Editing**: Edit own messages (shows "edited" label)
- **Message Deletion**: Delete own messages; admin can delete any
- **Read Receipts**: Green double-tick on own sent messages when read
- **Typing Indicators**: Animated 3-dot bounce when someone is typing
- **Online Presence**: Green dot badge on avatars (from `active_sessions`, 5-min window)
- **Unread Count Badges**: Gold badge on conversation list for unread messages
- **Role Badges**: 👑 Admin, 🏪 Seller, 🚴 Delivery, ✨ Stylist shown on every message
- **Member Panel**: List members; click non-self member to start DM directly
- **Shared Files Panel**: Chronological list of all files shared in the conversation
- **Polling**: Auto-refreshes every 2.5 seconds for near-real-time feel (Vercel-compatible)
- **Dark Glassmorphism UI**: Specs golden accent palette on deep dark `#0d1117` background

**Navigation Entry Points:**
- Admin sidebar: `💬 Team Chat`
- Seller panel header: `💬 Chat` button
- Delivery panel header: `💬 Team Chat` button
### 22. 📈 Specs CRM Platform ([crm.js](file:///C:/Users/Admin/Specs/frontend/src/pages/crm.js)) ← NEW (2026-07-13)
Access: `/crm` — staff roles only (admin, seller, delivery, stylist). Regular customers are auto-redirected.

**Features:**
- **📊 Executive Dashboard Tab**: KPI cards (Pipeline Value, Conversion Rate %, Total Leads, Overdue Tasks), Visual Sales Funnel (New → Contacted → Qualified → Prescription Consult → Offer Sent → Converted), Lead Sources breakdown, Hot Leads leaderboard.
- **🎯 Kanban Pipeline Board**: Stage-column view with lead cards, lead score badges (🔥 Hot, ✨ Warm, ❄️ Cold), estimated deal value, and instant stage dropdown updater.
- **👥 Customer Directory**: Searchable, sortable table with filters for stage/source/query, spent amount, order count, and Inspect action.
- **⏰ Follow-up Task Manager**: Schedule tasks with due dates, priorities (High/Med/Low), assigned agent, and completion checkbox.
- **📇 Customer Inspection Drawer**: Slide-out panel showing contact info, past orders history, timeline of calls/emails/notes/whatsapp, and log interaction modal.
- **🔄 Auto-Sync Engine**: One-click sync that scans storefront users and contact messages to auto-generate CRM leads with calculated lead scores!
Access: `/track` — Public. Accessible without sign-in/registration.
- **Search bar:** Enter any LS-prefixed 10-digit order tracking code (e.g. `LS1029384756`).
- **Real-time timeline:** High-fidelity vertical progression steps (Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered).
- **Masked details:** For privacy protection, guest/public queries show only masked customer names (`R***l S***a`) and shipping destination city.
- **Order summary:** Displays package items, lens configuration description, and direct courier dispatch/tracking logs.

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
| **Team Chat** | `https://lekyaspecs.vercel.app/chat` ← NEW (2026-07-13) |
