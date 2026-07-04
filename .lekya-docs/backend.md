# Backend Core Documentation — Express Server & Turso DB

The backend service is located in the [/backend](file:///C:/Users/Admin/Specs/backend) folder and handles user authentication, CRUD operations, Razorpay order verification, settings management, and automated mailing.

---

## 🔐 Admin Credentials (Updated)

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

1. **users** — name, email, password_hash, face_shape, role, loyalty_points, referral_code, created_at
2. **products** — name, description, price, category, gender, frame_shape, stock, image_urls
3. **orders** — user_id, total_amount, status, payment_id, lens_type, lens_price, prescription_details, tracking_comments, created_at
4. **order_items** — order_id, product_id, quantity, price
5. **reviews** — user_id, product_id, rating, comment, created_at
6. **store_settings** — key, value (CMS key-value store)
7. **coupons** — code, discount_type, discount_value, expiry_date, max_uses, times_used, is_active
8. **admin_activity_log** — admin_email, action_type, description, created_at
9. **contact_messages** — name, email, phone, subject, message, reply_message, replied_at, created_at

### DB Migrations (auto-applied on startup in `db.js`)
- `role` column on `users`
- `loyalty_points` column on `users`
- `referral_code` column on `users`
- `lens_type`, `lens_price`, `prescription_details`, `tracking_comments` columns on `orders`
- `coupons` table
- `admin_activity_log` table
- `contact_messages` table

---

## 🛣️ API Endpoints Routing

All API endpoints are defined in [app.js](file:///C:/Users/Admin/Specs/backend/src/app.js):

### 1. Authentication (`/api/auth`)
- `POST /register` → Creates user, hashes password, signs JWT. Also generates unique referral code.
- `POST /login` → Compares bcrypt hash, returns JWT token + full user object.
- `GET /profile` → Returns authenticated user profile.
- `PUT /profile` → Updates user details (face_shape, name, etc.).
- `GET /google` & `GET /facebook` → OAuth integrations. Auto-simulated with mock users if credentials missing in `.env`.

### 2. Products Catalog (`/api/products`)
- `GET /` → All products with sorting/filtering/search.
- `GET /filters` → Min/max price range + category tags.
- `GET /recommendations/:shape` → Face-shape matched glasses.
- `GET /:id` → Single product detail.

### 3. Orders & Razorpay (`/api/orders`)
- `POST /create` → Creates Razorpay order, stores prescription/lens details.
- `POST /verify` → Verifies Razorpay signature, marks order PAID.
- `GET /history` → Returns user's order history.
- `POST /review` → Submit a product review.

### 4. Coupons (`/api/coupons`)
- `POST /validate` → Validates coupon code, returns discount info.

### 5. Admin Panel (`/api/admin`) — all require `authenticateToken + isAdmin`
- `GET /stats` → Dashboard analytics (revenue, orders, customers, low stock alerts)
- `GET /orders` & `PUT /orders/:id` → Manage + update order status
- `PUT /orders/:id/tracking` → Update dispatch/tracking notes per order
- `GET /customers` → List all customers
- `GET /customers/:id` → Deep inspect a specific customer (profile + order history)
- `POST/PUT/DELETE /products` → Full CRUD for eyewear catalog
- `GET/PUT /settings` → CMS settings management
- `POST /create-admin` → Create a new admin sub-user
- `GET /admins` → List all admins
- `POST /demote-admin` → Revoke admin access
- `POST/GET/PUT/DELETE /coupons` → Coupon management
- `POST /broadcast` → Send bulk email or targeted email to a specific customer with placeholder name replacements and luxury templates.
- `GET /export/orders` → Download orders as CSV
- `GET /export/customers` → Download customers as CSV
- `GET /logs` → Admin activity log viewer
- `GET /db/health` → Database health stats (latency, row counts per table)
- `POST /db/optimize` → Run SQLite VACUUM optimization
- `GET /helpdesk` → Fetch all contact form submissions
- `POST /helpdesk/:id/reply` → Reply to a customer support message via email

### 6. Contact Form (`/api/contact`)
- `POST /` → Saves message to DB + sends email notification via SMTP.

---

## 📧 Email Utilities ([mailer.js](file:///C:/Users/Admin/Specs/backend/src/utils/mailer.js))
Uses `nodemailer` connecting to Google SMTP with App Passwords (`SMTP_EMAIL` and `SMTP_PASSWORD`).

- `sendWelcomeEmail({ to, name })` → Dispatches welcome email on registration.
- `sendContactEmail({ name, email, phone, subject, message })` → Forwards contact form to admin inbox.
- `sendBroadcastEmail({ to, subject, bodyHtml })` → Sends personalized bulk emails.
- `sendMail({ to, subject, html })` → Raw generic mailer for helpdesk replies.

---

## 🔑 Auth Middleware ([auth.js](file:///C:/Users/Admin/Specs/backend/src/middleware/auth.js))

- `authenticateToken` — Reads `Authorization: Bearer <token>` header, verifies JWT.
- `isAdmin` — Checks `req.user.role === 'admin'` OR email matches `dev.parceluncle@gmail.com`.

---

## ⚠️ Known Fixes Applied

| Date       | Bug | Fix |
|------------|-----|-----|
| 2026-07-04 | `getActivityLogs` missing in adminController → server crash on startup | Added function definition |
| 2026-07-04 | Duplicate `broadcastEmail` declaration → `SyntaxError` on require | Removed duplicate |
| 2026-07-04 | Login showing "Connection to server failed" | Fixed by resolving server crash above |
