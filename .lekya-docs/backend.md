# Backend Core Documentation — Express Server & Turso DB

The backend service is located in the [/backend](file:///C:/Users/Admin/Specs/backend) folder and handles user authentication, CRUD operations, Razorpay order verification, settings management, and automated mailing.

---

## 💾 Database Schema & Configuration

We use **Turso DB** (LibSQL/SQLite client). Connection configuration resides in [db.js](file:///C:/Users/Admin/Specs/backend/src/config/db.js).

### Database Initialization Schema ([seed.sql](file:///C:/Users/Admin/Specs/backend/src/config/seed.sql))
The SQL database contains the following tables:
1.  **users**: Stores name, email (unique), password_hash, face_shape, and registration date.
2.  **products**: Stores eyewear details (name, description, price, category, gender, frame_shape, stock, image_urls).
3.  **orders**: Stores order ID, user reference, total cost, status (PENDING, PAID, SHIPPED, DELIVERED), payment metadata, and items.
4.  **store_settings**: Key-value settings table for CMS (hero banner, text, background images).
5.  **order_items**: Sub-items included in orders.

### DB Seeding ([seed.js](file:///C:/Users/Admin/Specs/backend/src/config/seed.js))
*   Seeds default admin credentials.
*   Default Admin login: **`admin@specs.com`** / **`admin123`**
*   Default Admin bcrypt hash: `$2a$10$q2mJiCxdZCYfid9VXL3ro.76LVkCLNhjNMq5awBcavpMt7ja45X1S`.

---

## 🛣️ API Endpoints Routing

All API endpoints are defined in [app.js](file:///C:/Users/Admin/Specs/backend/src/app.js):

### 1. Authentication (`/api/auth`)
*   `POST /register` -> Creates a user, hashes password, and signs JWT.
*   `POST /login` -> Compares hashes and returns JWT token.
*   `GET /profile` -> Returns authenticated user profile.
*   `PUT /profile` -> Updates user details (such as face shape).
*   `GET /google` & `GET /facebook` -> OAuth integrations with Passport (simulated automatically with test mock users if keys are missing in `.env` to prevent crashes).

### 2. Products Catalog (`/api/products`)
*   `GET /` -> Fetches all products with sorting/filtering.
*   `GET /filters` -> Returns min/max price range and category tags for search catalog sidebar.
*   `GET /recommendations/:shape` -> Recommends glasses matched to face shape.

### 3. Orders & Razorpay (`/api/orders`)
*   `POST /create` -> Requests order placement, computes prices, and creates a Razorpay transaction ID.
*   `POST /verify` -> Cryptographically verifies Razorpay signatures and updates order status to `PAID`.

### 4. Admin Management (`/api/admin`)
*   `GET /stats` -> Returns sales analytics, orders count, and inventory counts.
*   `GET /orders` & `PUT /orders/:id` -> Manage store orders.
*   `GET /customers` -> Manage customers database.
*   `POST/PUT/DELETE /products` -> CRUD operations for eyeglasses and sunglasses catalog.

### 5. Contact & Mailer (`/api/contact`)
*   `POST /` -> Receives contact messages and dispatches SMTP welcome/notification emails.

---

## 📧 Email Utilities ([mailer.js](file:///C:/Users/Admin/Specs/backend/src/utils/mailer.js))
Uses `nodemailer` connecting to Google SMTP with App Passwords (`SMTP_EMAIL` and `SMTP_PASSWORD`).
*   `sendWelcomeEmail(to, name)` -> Dispatches welcome confirmation email.
*   `sendContactEmail(fromName, fromEmail, subject, message)` -> Forwards contact form questions to the admin inbox.
