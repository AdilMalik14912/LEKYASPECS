# Backend Core Documentation — Express Server & Turso DB

The backend service is located in the [/backend](file:///C:/Users/Admin/Specs/backend) folder and handles user authentication, CRUD operations, Razorpay order verification, settings management, automated mailing, and team chat messaging.

# Backend Core Documentation — Express Server & Turso DB

The backend service is located in the [/backend](file:///C:/Users/Admin/Specs/backend) folder and handles user authentication, CRUD operations, Razorpay order verification, settings management, automated mailing, and team chat messaging.

**Last Updated:** 2026-07-17

---

## 🔐 Admin Credentials

| Field    | Value                         |
|----------|-------------------------------|
| Email    | `dev.parceluncle@gmail.com`   |
| Password | `14912malik`                  |
| Role     | `admin` (super administrator) |

> The admin user is seeded automatically on every server startup via the `initDb()` migration in `db.js` using `INSERT OR REPLACE`.

---

## 💾 Database Schema & Configuration

We use **Turso DB** (LibSQL/SQLite client). Connection configuration resides in [db.js](file:///C:/Users/Admin/Specs/backend/src/config/db.js).

### Database Tables

1. **users** — name, email, phone, password_hash, face_shape, role, loyalty_points, referral_code, rider_lat, rider_lng, rider_last_seen, created_at
2. **products** — name, description, price, category, gender, frame_shape, stock, image_urls, style_tags
3. **orders** — user_id, total_amount, status, payment_id, lens_type, lens_price, prescription_details, tracking_comments, assigned_delivery_agent_id, delivery_notes, is_urgent, urgent_note, delivery_otp, shipping_address, tracking_id, created_at
4. **order_items** — order_id, product_id, quantity, price
5. **reviews** — user_id, product_id, rating, comment, spotlight, created_at
6. **store_settings** — key, value (CMS key-value store)
7. **coupons** — code, discount_type, discount_value, expiry_date, max_uses, times_used, is_active
8. **admin_activity_log** — admin_email, action_type, description, created_at
9. **contact_messages** — name, email, phone, subject, message, reply_message, replied_at, created_at
10. **otps** — name, email, phone, password_hash, otp_code, expires_at, verified, created_at
11. **active_sessions** — user_id, email, phone, session_key, ip_address, user_agent, last_active_at, created_at
12. **chat_conversations** — type (dm/group), name, description, avatar, created_by, created_at
13. **chat_members** — conversation_id, user_id, joined_at
14. **chat_messages** — conversation_id, sender_id, content, file_url, file_name, file_type, is_pinned, reply_to_id, message_type, edited_at, created_at
15. **chat_reads** — message_id, user_id, read_at (unique per message+user)
16. **chat_reactions** — message_id, user_id, emoji (unique per message+user+emoji)
17. **crm_leads** — user_id, name, email, phone, stage, source, lead_score, estimated_value, assigned_to, tags, notes, created_at, updated_at
18. **crm_interactions** — lead_id, user_id, created_by, type, subject, notes, outcome, created_at
19. **crm_tasks** — lead_id, assigned_to, created_by, title, description, due_date, priority, status, created_at

---

## 🛣️ API Endpoints Routing

All API endpoints are defined in [app.js](file:///C:/Users/Admin/Specs/backend/src/app.js):

### 1. Authentication (`/api/auth`)
- `POST /register/initiate` → Pre-registers details and sends 6-digit verification OTP (via Fast2SMS with email fallback).
- `POST /register/verify` → Verifies OTP code, creates customer account (JWT token returned), and triggers `upsertCrmLeadFromUser()` to auto-sync sales leads into CRM.
- `POST /register` → Legacy single-step registration fallback.
- `POST /login` → Dual login method supporting either Email address OR Phone number.
- `GET /profile` → Returns authenticated user profile.
- `PUT /profile` → Updates user details (face_shape, name, phone, etc.).
- `GET /google` & `GET /facebook` → OAuth integrations. Auto-simulated with mock users if credentials missing in `.env`.

### 2. Products Catalog (`/api/products`)
- `GET /` → All products with sorting/filtering/search.
- `GET /filters` → Min/max price range + category tags.
- `GET /recommendations/:shape` → Face-shape matched glasses.
- `GET /:id` → Single product detail.

### 3. Orders & Razorpay (`/api/orders`)
- `POST /create` → Creates Razorpay order, stores prescription/lens details.
- `POST /verify` → Verifies Razorpay signature, marks order PAID.
- `POST /webhook` → HMAC-SHA256 Razorpay webhook handler for async payment updates & auto-fulfillment.
- `GET /history` → Returns user's order history.
- `POST /review` → Submit a product review.
- `GET /track/:trackingId` → Public tracking lookup (no authentication needed). Returns masked customer metadata and items details list.

### 4. Coupons (`/api/coupons`)
- `POST /validate` → Validates coupon code, returns discount info.

### 5. Admin Panel (`/api/admin`) — all require `authenticateToken + isAdmin`
- `GET /stats` → Dashboard analytics (revenue, orders, customers, low stock alerts)
- `GET /orders` & `PUT /orders/:id` → Manage + update order status
- `POST /refund/:id` → Issues instant Razorpay API refund for cancelled/returned orders
- `PUT /orders/:id/tracking` → Update dispatch/tracking notes per order
- `GET /customers` → List all customers
- `GET /customers/:id` → Deep inspect a specific customer (profile + order history)
- `PUT /customers/:id/credentials` → Edit customer details (name, email, phone, role) and reset/re-hash password
- `POST/PUT/DELETE /products` → Full CRUD for eyewear catalog
- `GET/PUT /settings` → CMS settings management
- `POST /create-admin` → Create a new admin sub-user
- `GET /admins` → List all admins
- `POST /demote-admin` → Revoke admin access
- `POST/GET/PUT/DELETE /coupons` → Coupon management
- `POST /broadcast` → Send bulk email or targeted email
- `GET /export/orders` → Download orders as CSV
- `GET /export/customers` → Download customers as CSV
- `GET /logs` → Admin activity log viewer
- `GET /db/health` → Database health stats
- `POST /db/optimize` → Run SQLite VACUUM optimization
- `GET /helpdesk` → Fetch all contact form submissions
- `POST /helpdesk/:id/reply` → Reply to a customer support message via email
- `GET /active-sessions` → Real-time list of online users
- `GET /riders/live-map` → All riders with GPS + active orders for admin map

### 6. Seller Panel (`/api/seller`) — require `authenticateToken + isSeller` ← NEW (2026-07-10)
- `GET /stats` → Seller dashboard stats (orders, revenue, products, agents)
- `GET /orders` → All orders with customer + agent info
- `PUT /orders/:id/status` → Update order status
- `POST /orders/:id/assign` → Manually assign a delivery agent
- `POST /orders/:id/auto-assign` → 🤖 Auto-assign to least-busy agent
- `PUT /orders/:id/urgent` → ⚡ Toggle urgent/express flag with reason note
- `GET /delivery-agents` → List all delivery agents
- `GET /agent-workloads` → Per-agent stats: active orders, delivered count, success rate
- `GET /stale-orders` → Orders paid > 1hr ago but still unassigned
- `GET /inventory` → Product inventory list
- `POST /products` → Add new product
- `PUT /products/:id` → Edit product details

### 7. Delivery Agent Panel (`/api/delivery`) — require `authenticateToken + isDelivery` ← NEW (2026-07-10)
- `GET /stats` → Rider stats (total assigned, delivered, active, shipped, today)
- `GET /my-orders` → All orders assigned to this agent
- `GET /available` → Unassigned paid orders that agent can claim
- `POST /claim/:id` → Claim an available order
- `PUT /orders/:id/status` → Update order delivery status (Shipped/Out for Delivery/Delivered). Generates a 6-digit Delivery OTP when marked as Out for Delivery or Shipped; requires correct `delivery_otp` in request body when marking as `Delivered`.
- `PUT /location` → 📍 Update rider GPS location (lat/lng) — called every 30s
- `GET /map-orders` → Active orders with shipping addresses for route map

### 8. Brand Stylist Hub (`/api/stylist`) — require `authenticateToken`
- `GET /products` → Get products list with their style tags
- `PUT /products/:id/tags` → Add/remove customized style tags on a product
- `GET/POST /lookbook` → View or curate seasonal visual lookbook collections
- `GET/POST /calendar` → Retrieve or plan content launching calendars
- `GET/POST /spotlight` → Pin specific frames to homepage showcase lists
- `GET/POST /color-stories` → Set and group frames into curated color themes
- `GET/POST /advisor` → Link face shapes categories to recommended frame types
- `GET /reviews` & `PUT /reviews/:id/spotlight` → View product reviews and pin top review testimonials
- `GET/POST /tone-profile` → Configure brand voice guides and track luxury score copy guidelines

### 9. Contact Form (`/api/contact`)
- `POST /` → Saves message to DB + sends email notification via SMTP.

### 10. Team Chat (`/api/chat`) — require `authenticateToken + isTeamMember` (admin/seller/delivery/stylist) ← NEW (2026-07-13)

Controlled by [chatController.js](file:///C:/Users/Admin/Specs/backend/src/controllers/chatController.js):

- `GET /team` → All team members with real-time online status (from active_sessions)
- `GET /conversations` → My conversations (DMs + groups) with unread counts + last message preview
- `POST /conversations/dm` → Start or get existing DM with a team member
- `POST /conversations/group` → Create a named group channel with selected members + description
- `DELETE /conversations/:id` → Leave a group (or delete a DM)
- `GET /conversations/:id/messages` → Paginated message history (50 per page) with reactions + read receipts
- `POST /conversations/:id/messages` → Send text or file message (Cloudinary base64 upload, max 10MB)
- `POST /conversations/:id/read` → Mark all messages as read
- `GET /conversations/:id/pinned` → Fetch pinned messages in conversation
- `GET /conversations/:id/files` → Fetch all shared files/attachments in conversation
- `GET /conversations/:id/members` → List group members with online status
- `POST /conversations/:id/members` → Add a user to a group channel
- `DELETE /conversations/:id/members/:uid` → Remove a member (self or admin only)
- `PUT /messages/:id/pin` → Toggle pin/unpin a message
- `PUT /messages/:id/edit` → Edit own message text
- `DELETE /messages/:id` → Delete own message (or any message if admin)
- `POST /messages/:id/react` → Toggle an emoji reaction (adds or removes)
- `POST /typing` → Set typing status (in-memory store, expires after 4s)
- `GET /typing/:id` → Get list of who is currently typing in a conversation

### 11. Customer Relationship Management (`/api/crm`) — require `authenticateToken + isTeamMember` ← NEW (2026-07-13)

Controlled by [crmController.js](file:///C:/Users/Admin/Specs/backend/src/controllers/crmController.js):

- `GET /stats` → Executive CRM Analytics (total leads, pipeline value, conversion rate %, funnel stages breakdown, overdue tasks, hot leads)
- `GET /leads` → List leads/customers with filters (stage, source, assignedTo, search query, sorting by score/value)
- `GET /leads/:id` → Detailed lead profile (contact info, order history, timeline of interactions, follow-up tasks)
- `POST /leads` → Manually add a sales lead
- `PUT /leads/:id` → Update lead stage, score, deal value, tags, notes, or assigned staff member
- `POST /leads/:id/interactions` → Log a customer call, email, meeting, WhatsApp, or internal note
- `GET /tasks` → List follow-up tasks filtered by status, priority, or assigned staff
- `POST /tasks` → Schedule a follow-up task with due date and priority
- `PUT /tasks/:id` → Update task status (Pending / Completed) or priority
- `POST /auto-sync` → Auto-populates CRM leads from existing storefront registered users and contact form inquiries
- `POST /ai-automate` → Runs the AI Autonomous Lead Auto-Scoring & Auto-Task Scheduler engine
- `POST /ai-generate-email` → Generates personalized AI sales outreach pitch tailored to face shape & purchase history

---

## 🔑 Auth Middleware ([auth.js](file:///C:/Users/Admin/Specs/backend/src/middleware/auth.js))

- `authenticateToken` — Reads `Authorization: Bearer <token>` header, verifies JWT.
- `isAdmin` — Checks `req.user.role === 'admin'` OR email matches `dev.parceluncle@gmail.com`.
- `isSeller` — Checks `req.user.role === 'seller'` OR `isAdmin`.
- `isDelivery` — Checks `req.user.role === 'delivery'` OR `isAdmin`.
- `isTeamMember` _(inline in app.js)_ — Checks `req.user.role` is one of `['admin','seller','delivery','stylist']`. Used exclusively for all `/api/chat/*` routes. ← NEW (2026-07-13)

---

## 📧 Email Utilities ([mailer.js](file:///C:/Users/Admin/Specs/backend/src/utils/mailer.js))
Uses `nodemailer` connecting to Google SMTP with App Passwords (`SMTP_EMAIL` and `SMTP_PASSWORD`).

- `sendWelcomeEmail({ to, name })` → Dispatches welcome email on registration.
- `sendContactEmail({ name, email, phone, subject, message })` → Forwards contact form to admin inbox.
- `sendBroadcastEmail({ to, subject, bodyHtml })` → Sends personalized bulk emails.
- `sendMail({ to, subject, html })` → Raw generic mailer for helpdesk replies.
- `sendDeliveryOtpEmail({ to, customerName, orderId, otp })` → Dispatches a secure delivery verification OTP code to customers via email.
- `sendStatusUpdateEmail({ to, customerName, orderId, status, note, totalAmount })` → Sends a premium, style-curated status timeline email to customer on every order status modification.

---

## 📱 SMS Utilities ([sms.js](file:///C:/Users/Admin/Specs/backend/src/utils/sms.js))
Uses `fetch` connecting to **Fast2SMS API gateway** using `FAST2SMS_API_KEY` environment variable.

- `sendOtpSms({ to, otp })` → Dispatches a 6-digit OTP code via Fast2SMS.
- `sendStatusUpdateSms({ to, customerName, orderId, status, note })` → Dispatches real-time text message alerts to the customer's phone during order status transitions.

---

## 📦 Parcel Uncle Logistics Merchant API ([parcelUncle.js](file:///C:/Users/Admin/Specs/backend/src/utils/parcelUncle.js) & [shippingController.js](file:///C:/Users/Admin/Specs/backend/src/controllers/shippingController.js))
Official Merchant API v1 integration connecting to Parcel Uncle Courier Network.

- **Active Live Production API Key**: `pu_live_3a58bac546fddf0d9402569053b0f5e7da28915ac3822d8c`
- **Carrier Base URL**: `https://parceluncle.com/carrier/v1/merchant/`
- **Auth Header**: `X-API-Key: pu_live_...`
- **Live Webhook URL**: `https://lekyaspecs.vercel.app/api/shipping/parcel-uncle/webhook`

### 🛠️ Connected Utility Functions:
- `createShipment({ orderId, customerName, customerPhone, shippingAddress, items, totalAmount, isUrgent, isCod })` → Manifests shipment with strict 10-digit phone & 6-digit pincode sanitization, multi-URL candidate fallback, and transparent error reporting.
- `getShippingLabel(trackingNumber)` → Downloads 4x6 inch printable PDF shipping label (with QR code, barcode, COD badge).
- `registerWebhook(webhookUrl)` → Registers merchant webhook URL via `PUT /carrier/v1/merchant/webhook/`.
- `getNdrList(status)` & `takeNdrAction(trackingNumber, actionData)` → Fetches Non-Delivery Reports & submits `REATTEMPT` / `ADDRESS_UPDATE` / `RTO` actions.
- `getTrackingStatus(waybill)` → Queries real-time tracking status & timeline.
- `checkServiceability(pincode)` & `getRateQuote(quoteData)` → Pincode serviceability & shipping rate calculations.
- `cancelShipment(waybill)` → Cancels a waybill shipment & requests wallet refund.

### 🛣️ Endpoints Registered (`app.js`):
- `POST /api/shipping/parcel-uncle/dispatch/:orderId` → 1-Click order dispatch.
- `POST /api/shipping/parcel-uncle/sync/:orderId` → Live status sync.
- `POST /api/shipping/parcel-uncle/webhook` → Live webhook receiver.
- `PUT /api/shipping/parcel-uncle/register-webhook` → Webhook auto-registration.
- `GET /api/shipping/parcel-uncle/track/:waybillOrOrderId` → Tracking lookup.
- `GET /api/shipping/parcel-uncle/label/:waybillOrOrderId` → Download 4x6 PDF Shipping Label.
- `GET /api/shipping/parcel-uncle/ndr` & `POST /api/shipping/parcel-uncle/ndr/:trackingNumber/action` → NDR management.
- `GET /api/shipping/parcel-uncle/serviceability` & `POST /api/shipping/parcel-uncle/rates` → Serviceability & rate quotes.
- `POST /api/shipping/parcel-uncle/cancel/:orderId` → Cancel shipment.
- `GET /api/shipping/parcel-uncle/config` → Merchant health & key status.

---

## ⚠️ Known Fixes Applied

| Date       | Bug | Fix |
|------------|-----|-----|
| 2026-07-04 | `getActivityLogs` missing in adminController → server crash on startup | Added function definition |
| 2026-07-04 | Duplicate `broadcastEmail` declaration → `SyntaxError` on require | Removed duplicate |
| 2026-07-04 | Login showing "Connection to server failed" | Fixed by resolving server crash above |
| 2026-07-05 | `tryon.js` shadowing native `Image` constructor with lucide import | Renamed import to `Image: ImageIcon` |
| 2026-07-05 | `admin.js` undefined icon imports causing Next.js compile failure | Imported `Sparkles` and `Edit` icons |
| 2026-07-05 | `stylist.js` ReferenceError: `Head` is not defined during prerendering | Added `next/head` import |
| 2026-07-10 | `seller.js` and `delivery.js` crash on load due to invalid `useToast` import | Removed `useToast`, implemented local toast system |
| 2026-07-10 | Seller page blank on `/seller` route | Fixed by properly exporting default function |
| 2026-07-23 | `ReferenceError: Download is not defined` crash on `/account` page | Added `Download` to `lucide-react` imports in `account.js`. |
| 2026-07-23 | Integrate Parcel Uncle Production Key & Complete API Suite (v1.0.3) | Switched to LIVE key `pu_live_3a58bac5...`, added 4x6 PDF Label downloads, Webhook Auto-Registration, NDR management, multi-URL fallback, phone/pincode sanitization, and 1-Click Admin buttons. |
| 2026-07-23 | Product SKU items & 4x6 Thermal Label Generator (v1.0.4) | Added `items`, `order_items`, and `sku_items` arrays to Parcel Uncle API payload with `SKU-LEKYA-{id}` codes & prices. Added 4x6 Thermal Printable Label Generator fallback with barcode & QR code. |
