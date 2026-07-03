# Frontend Core Documentation — Pages & Client Logic

The Lekya Specs frontend is built with Next.js using the Pages router. Global state is managed via React Contexts in [_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js).

---

## 🔑 Global State Management (Contexts)

[_app.js](file:///C:/Users/Admin/Specs/frontend/src/pages/_app.js) provides three main global contexts:
1.  **AuthContext:** Manages user login, session token persistency (localStorage sync), and logout.
2.  **CartContext:** Manages shopping bag items, items count, additions, deletions, quantity changes, and persistency.
3.  **WishlistContext:** Manages favorite items toggling and persistency.

---

## 🖥️ Primary Application Pages

### 1. 🏠 Homepage ([index.js](file:///C:/Users/Admin/Specs/frontend/src/pages/index.js))
*   **Hero Slider:** Displays sliding premium banner images with dynamically configured CMS headlines.
*   **Discovery Grid:** Promotes core features: Face Shape Detector, Bespoke Customizer, and Try-On Lab.
*   **Featured Items:** Dynamically queries the backend to show the top 4 featured glasses frames.

### 2. 🛍️ Shop Catalog ([shop.js](file:///C:/Users/Admin/Specs/frontend/src/pages/shop.js))
*   **Server Filtering:** Queries `/api/products` using query parameters: `category`, `gender`, `frame_shape`, and `search`.
*   **Dynamic Sorting:** Supports price sorting (low to high, high to low) and alphabetic sorting.

### 3. 🤖 AI Face Shape Detector ([face-shape.js](file:///C:/Users/Admin/Specs/frontend/src/pages/face-shape.js))
*   **neural Network:** Uses `TinyFaceDetector` and `FaceLandmark68Net` loaded dynamically from jsDelivr CDN.
*   **Auto-Calibration:** Detects 68 landmark coordinates client-side to calculate face height-to-width ratios and determines shape (oval, round, square, heart, diamond).
*   **Profile Save:** Instantly updates the logged-in user profile shape recommendation in DB via `/api/auth/profile`.

### 4. 🥽 Live AR Try-On Lab ([ar-tryon.js](file:///C:/Users/Admin/Specs/frontend/src/pages/ar-tryon.js))
*   **Optimized Render Loop:** Uses a non-blocking render architecture running `requestAnimationFrame` at a smooth 60fps.
*   **Background AI Detection:** Runs the face-api detection at a slower interval (~80ms) in the background. It uses `inputSize: 160` (instead of 320) for 4× faster processing.
*   **Glasses Rendering:** Draws 6 frame styles (Wayfarer, Round, Aviator, Cat-Eye, Rectangle, Hexagonal) directly on the canvas using eye coordinates.
*   **Snapshot:** Captures the canvas as PNG and supports instant local downloading.

### 5. 🎨 Skin Tone AI Lab ([skin-analysis.js](file:///C:/Users/Admin/Specs/frontend/src/pages/skin-analysis.js))
*   **Pixel Sampling:** Uses canvas context `getImageData()` to extract color pixels from 4 facial zones (cheeks, nose-tip, forehead) from user-uploaded images.
*   **Classification:** Computes Fitzpatrick Scale (I-VI) and matches undertones (warm, cool, neutral).
*   **AI DNA Report:** Recommends frame colors, lens colors, style icons, and alerts about colors to avoid.

### 6. 🛠️ Bespoke Customizer ([customizer.js](file:///C:/Users/Admin/Specs/frontend/src/pages/customizer.js))
*   **SVG Rendering:** Renders vector glass frames dynamically using client sliders for size, lens opacity, material color, and monograms.

### 7. 💳 Checkout & Razorpay Sandbox ([checkout.js](file:///C:/Users/Admin/Specs/frontend/src/pages/checkout.js))
*   **Razorpay Integration:** Opens standard Razorpay Checkout window on payment action.
*   **Sandbox Simulator:** Fallback mock simulation modal for testing full payment completions without real cards.
*   **Prescription Intake Wizard:** Optional checkout panel where users configure SPH, CYL, Axis, PD, lens indexes (1.56 to 1.74), and custom lens protective coatings. Lens custom pricing options dynamically adjust the final order grand total billing.

### 8. 👓 AI Prescription Lens Studio ([lens-guide.js](file:///C:/Users/Admin/Specs/frontend/src/pages/lens-guide.js))
*   **Vision Distortion Engine:** Canvas-based rendering that dynamically distorts the background grid to simulate lens refraction based on user sphere inputs (minimized for myopia (-), magnified for hyperopia (+)).
*   **Edge Thickness Silhouette:** Multi-index (1.56 to 1.74) 2D thickness visualizer which updates automatically based on selected refractive indexes and prescription power.
*   **Premium Interactive Coatings:**
    *   *Anti-Reflective Coating:* Glare-line refractions vanish on toggle.
    *   *Blue Light Protection:* Purple/blue lens reflection arcs activate.
    *   *Photochromic transitions:* Sunlight exposure slider shifts transparency to sunglasses charcoal tints.

### 9. 🔍 Product Detail View ([product/[id].js](file:///C:/Users/Admin/Specs/frontend/src/pages/product/[id].js))
*   Provides product specs, dimensions guides, user review forms, average ratings, and checks profile face-shape to suggest optimal matches.
*   Uses dynamic `API_BASE` to prevent production routing breaks.
*   **Recently Viewed Tracker:** Listens to product visits to build client-side browser browsing history.

### 10. 🏠 Homepage Dashboard ([index.js](file:///C:/Users/Admin/Specs/frontend/src/pages/index.js))
*   **Smart Recommendations:** Checks profile face shape data to display personal eyewear suggestions. Shows custom call-to-actions to take the AI Scan if no profile shape is saved.
*   **Recently Viewed Strip:** Renders horizontal sliding product cards tracking items visited during the session.

### 11. 🛍️ Eyewear Catalog ([shop.js](file:///C:/Users/Admin/Specs/frontend/src/pages/shop.js))
*   **Quick View Modal:** Allows customers to inspect specifications, stock alerts, description copy, and checkout immediately in a quick popup window from the main list.
*   **Recently Viewed Strip:** Renders horizontal sliding product cards tracking items visited during the session.
