# Frontend Core Documentation — Pages & Client Logic

The Lekya Specs frontend is built with Next.js using the Pages router. Global state is managed via React Contexts in [_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js).

---

## 🔑 Global State Management (Contexts)

[_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js) provides the following global contexts:

1. **AuthContext** — User login/logout, JWT token persistence in localStorage, profile updates.
2. **CartContext** — Cart items, quantity changes, stock limits, localStorage sync.
3. **WishlistContext** — Wishlist toggle & persistence.
4. **ToastContext** — Slide-up toast notifications for user actions.

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
- **Smart BG Removal**: Canvas `getImageData()` pixel engine strips white/grey backgrounds from catalog product images — glasses float cleanly on face.
- **Live Webcam Mode**: `getUserMedia()` webcam stream with real-time glasses overlay, Snap Photo button captures the frame.
- **Mirror Mode**: Toggle CSS `scaleX(-1)` on preview for a realistic mirror experience.
- **Before/After Split View**: Drag-to-compare divider reveals face before/after glasses overlay.
- **8 SVG Frame Shapes**: Wayfarer, Round, Aviator, Cat-Eye, Rectangle, Hexagonal, Rimless, Browline — all with realistic drop shadows.
- **10 Frame Colors** with live color dot picker.
- **AI Auto-Fit**: face-api.js TinyFaceDetector aligns glasses to eye landmarks automatically.
- **BG Tolerance Slider**: Fine-tune how aggressively background pixels are removed.
- **Save PNG**: Canvas compositing exports face + transparent glasses as downloadable PNG.
- **Catalog Product Try-On**: Select any product from the live database; background is auto-removed.

### 5. 🎨 Skin Tone AI Lab ([skin-analysis.js](file:///C:/Users/Admin/Specs/frontend/src/pages/skin-analysis.js))
- Canvas `getImageData()` pixel sampling from facial zones.
- Fitzpatrick Scale (I-VI) + undertone (warm/cool/neutral) classification.
- Frame color + lens color recommendations.

### 6. 🛠️ Bespoke Customizer ([customizer.js](file:///C:/Users/Admin/Specs/frontend/src/pages/customizer.js))
- SVG-based frame rendering with sliders for size, opacity, color, monogram.

### 7. 💳 Checkout & Razorpay ([checkout.js](file:///C:/Users/Admin/Specs/frontend/src/pages/checkout.js))
- Razorpay Checkout window integration.
- Mock sandbox fallback simulator for testing.
- **Prescription Intake Wizard** — SPH, CYL, Axis, PD fields + lens index (1.56–1.74) + coatings (Anti-Glare, Blue Shield, Photochromic). Dynamically adjusts final order total.
- **Coupon Code Input** — validates via `/api/coupons/validate` and applies discount live.

### 8. 👓 AI Prescription Lens Studio ([lens-guide.js](file:///C:/Users/Admin/Specs/frontend/src/pages/lens-guide.js))
- Canvas-based vision distortion engine simulating lens refraction.
- Multi-index (1.56–1.74) edge thickness silhouette visualizer.
- Interactive coating toggles: Anti-Reflective, Blue Light, Photochromic.

### 9. 🔍 Product Detail Page ([product/[id].js](file:///C:/Users/Admin/Specs/frontend/src/pages/product/[id].js))
- Product specs, image gallery, reviews, face-shape match indicator.
- Related products (same category).
- Recently Viewed tracker in localStorage.
- **Prescription Lens Configurator** — checkbox expands a full lens selector with:
  - Lens Index: 1.56 Standard / 1.61 Thin / 1.67 Ultra Thin / 1.74 Super Ultra Thin
  - Coatings: Anti-Glare (+₹300), Blue Shield (+₹400), Photochromic (+₹800)
  - Live dynamic price update shown on Add to Cart button.

### 10. 👤 Account Dashboard ([account.js](file:///C:/Users/Admin/Specs/frontend/src/pages/account.js))
- Profile info, face shape, edit modal, and Dual Phone/Email login & registration with 6-digit OTP verification.
- Order history with status badges.
- **Specs Rewards Club** — displays loyalty points balance, tier (Bronze/Silver/Gold), and referral link copy button.
- **Order Tracking Notes** — shows admin-added dispatch notes per order.
- **AI Face Scanner** — simulates face shape scan and saves result to profile.

### 11. 🛡️ Admin Panel ([admin.js](file:///C:/Users/Admin/Specs/frontend/src/pages/admin.js))
Access: `/admin` — only users with `role: admin` or email `dev.parceluncle@gmail.com` can enter.

**Tabs & Features:**

| Tab | Feature |
|-----|---------|
| Dashboard | Sales analytics, revenue chart, low stock alerts, recent activity log |
| Customer Orders | List orders, update status, add dispatch/tracking notes per order |
| Product Catalog | Add / Edit / Delete eyewear products with images |
| View Customers | List all customers (with phone number search/grid column), click to Inspect Profile (order history overlay & Edit Credentials form) |
| Promotions | Create, toggle, delete coupon codes (% or fixed amount) |
| Broadcast Email | Send personalized bulk or targeted email to specific customers using 7 pre-styled luxury HTML templates |
| Settings CMS | Update hero banner, headline text, background images |
| Admin Roles | Create new sub-admins, view admin list, demote admins |
| Support Helpdesk | View contact form messages, reply via email directly |
| DB Optimizer | See DB latency, table row counts, run VACUUM optimization |
| Export Data | Download orders or customers as CSV |

### 12. 🎨 Brand Stylist Hub ([stylist.js](file:///C:/Users/Admin/Specs/frontend/src/pages/stylist.js))
Access: `/stylist` — A panel separate from operations where creative directors/stylists manage content, curation, and visual brand language.

**Modules & Features:**
- **Lookbook Builder**: Create/manage themed editorial campaigns combining descriptions with selected frames.
- **Face Shape Advisor**: Link facial categories (oval, round) to recommended frame geometries.
- **Spotlight Manager**: Feature preferred design frames dynamically on the main shop pages.
- **Style Tag Editor**: Append descriptive aesthetic keywords to catalog items.
- **Color Story Board**: Bundle frames into curated color stories (e.g., Summer Neon, Classic Blacks).
- **Product Photo Hub**: Examine and audit all visual assets and image URLs.
- **Content Calendar**: Schedule upcoming drops, marketing themes, and channel timelines.
- **Review Spotlight**: Feature specific customer testimonials directly on details pages.
- **Comparison Matrix**: Side-by-side spec comparison table for creative analysis.
- **Brand Voice Checker**: Scan copy for luxury keywords and check for un-premium banned words.
- **Sandbox Preview**: Test mock frame overlays instantly on different face models.

### 13. 🛡️ Privacy Policy Page ([privacy.js](file:///C:/Users/Admin/Specs/frontend/src/pages/privacy.js))
- Comprehensive disclosures detailing local browser-side biometric processing (auto-fit parameters never leaving user device), Secure PCI payments processing (via Razorpay), and zero-spam guidelines.

---


## 🎨 Design System

- **Theme:** Rich Black (`#0A0A0A` / `#121212`) + Metallic Gold (`#C5A028`) + Off-white
- **Typography:** Inter / Outfit (Google Fonts)
- **Effects:** Glassmorphism nav, smooth micro-animations, gold borders, dark premium panels
- **Styling:** Vanilla CSS in `globals.css` — no Tailwind

---

## ⚠️ Important Import Notes

- All pages use `const React = require('react')` (CommonJS) — **do NOT use ES module `import` syntax**
- lucide-react icons must all be included in the single destructured `require('lucide-react')` call at the top of each page
- Missing icon imports (e.g., `X` for close buttons) will silently fail — always verify before adding new modals
