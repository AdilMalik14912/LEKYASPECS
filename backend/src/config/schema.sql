-- Lekya Specs — SQLite/Turso Schema
-- PRAGMA for foreign key support (run once at connection time)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT NULL,
    password_hash TEXT NOT NULL,
    face_shape TEXT DEFAULT NULL,
    role TEXT DEFAULT 'user',
    loyalty_points INTEGER DEFAULT 0,
    referral_code TEXT DEFAULT NULL,
    avatar TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 1b. OTPs Table for Registration Verification
CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT NULL,
    password_hash TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Products Table
-- image_urls stored as JSON array string e.g. '["url1","url2"]'
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    gender TEXT NOT NULL,
    frame_shape TEXT NOT NULL,
    image_urls TEXT NOT NULL DEFAULT '[]',
    stock INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Orders Table
-- shipping_address stored as JSON string
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    payment_id TEXT DEFAULT NULL,
    shipping_address TEXT NOT NULL DEFAULT '{}',
    lens_type TEXT DEFAULT NULL,
    lens_price REAL DEFAULT 0.0,
    prescription_details TEXT DEFAULT NULL,
    tracking_comments TEXT DEFAULT NULL,
    tracking_id TEXT UNIQUE DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Face-Shape → Frame-Shape Mapping
-- recommended_frame_shapes stored as JSON array string
CREATE TABLE IF NOT EXISTS frame_shape_mapping (
    face_shape TEXT PRIMARY KEY,
    recommended_frame_shapes TEXT NOT NULL DEFAULT '[]'
);

-- 7. Store CMS Settings
CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- 8. Coupons / Promo Codes
CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value REAL NOT NULL,
    expiry_date TEXT DEFAULT NULL,
    max_uses INTEGER DEFAULT NULL,
    times_used INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 9. Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 10. Contact Messages (Helpdesk Reply Hub)
CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    reply_message TEXT DEFAULT NULL,
    replied_at TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 11. HO Reports Table
CREATE TABLE IF NOT EXISTS ho_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    report_date TEXT DEFAULT (date('now')),
    tasks_completed TEXT NOT NULL,
    tasks_pending TEXT,
    issues_faced TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 12. Order Returns & Exchanges Table
CREATE TABLE IF NOT EXISTS order_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    return_type TEXT DEFAULT 'return',
    reason TEXT NOT NULL,
    comments TEXT DEFAULT NULL,
    status TEXT DEFAULT 'Requested',
    waybill_id TEXT DEFAULT NULL,
    refund_amount REAL DEFAULT 0.0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 12. WhatsApp Incoming Messages Log (Auto-Reply CRM)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    customer_name TEXT DEFAULT 'Unknown',
    message_body TEXT,
    detected_intent TEXT DEFAULT 'unknown',
    auto_replied INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wa_messages_phone ON whatsapp_messages (phone);
