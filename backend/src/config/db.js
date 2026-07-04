/**
 * db.js — Turso (LibSQL/SQLite) database client
 * Replaces the previous PostgreSQL (pg) pool.
 *
 * The `query(sql, params)` helper mirrors the pg API shape so all existing
 * controllers only need minor SQL changes (no structural refactor required).
 *
 *   pg:      db.query('SELECT * FROM t WHERE id = $1', [id])
 *   libsql:  db.query('SELECT * FROM t WHERE id = ?', [id])
 *
 * Return value shape:   { rows: [...] }
 * For INSERT/UPDATE/DELETE RETURNING rows are also in `rows`.
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ── Create Turso client ────────────────────────────────────────────────────
const client = createClient({
  url:       process.env.TURSO_URL   || 'file:local.db', // fallback to local file
  authToken: process.env.TURSO_TOKEN || undefined,
});

// ── Simple query wrapper ───────────────────────────────────────────────────
/**
 * Execute a SQL statement with positional `?` parameters.
 * Returns { rows } where rows is an array of plain objects.
 */
const query = async (sql, params = []) => {
  const result = await client.execute({ sql, args: params });
  // libsql returns result.rows as an array of Row objects.
  // Convert each Row to a plain JS object.
  const rows = result.rows.map(row => {
    const obj = {};
    result.columns.forEach((col, i) => {
      let val = row[i];
      // Auto-parse JSON columns (image_urls, recommended_frame_shapes, shipping_address)
      if (
        typeof val === 'string' &&
        (val.startsWith('[') || val.startsWith('{'))
      ) {
        try { val = JSON.parse(val); } catch (_) {}
      }
      obj[col] = val;
    });
    return obj;
  });
  return { rows };
};

// ── Transaction helper ─────────────────────────────────────────────────────
/**
 * Run a callback inside a serialized transaction.
 * Usage:
 *   await db.transaction(async (tx) => {
 *     await tx.query('INSERT ...', [...]);
 *     await tx.query('UPDATE ...', [...]);
 *   });
 */
const transaction = async (callback) => {
  const tx = await client.transaction('write');
  try {
    const txDb = {
      query: async (sql, params = []) => {
        const result = await tx.execute({ sql, args: params });
        const rows = result.rows.map(row => {
          const obj = {};
          result.columns.forEach((col, i) => {
            let val = row[i];
            if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
              try { val = JSON.parse(val); } catch (_) {}
            }
            obj[col] = val;
          });
          return obj;
        });
        return { rows };
      }
    };
    const result = await callback(txDb);
    await tx.commit();
    return result;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
};

// ── Schema initialiser ─────────────────────────────────────────────────────
const initDb = async () => {
  try {
    console.log('Connecting to Turso database...');
    await client.execute('SELECT 1');
    console.log('Turso connection successful.');

    // Load and run schema — each statement individually
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .split(';')
        .map(s => s.replace(/--[^\n]*/g, '').trim())   // strip inline comments
        .filter(s => s.length > 0);

      for (const stmt of statements) {
        try {
          await client.execute(stmt);
        } catch (stmtErr) {
          // Log but don't abort — some statements may already exist
          if (!stmtErr.message.includes('already exists')) {
            console.warn('Schema stmt warning:', stmtErr.message, '\nSQL:', stmt.slice(0, 80));
          }
        }
      }
      console.log('Database schema verified/applied.');
    }

    // Programmatic migrations
    try {
      await client.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
      console.log('Migration: Added role column to users table.');
    } catch (_) {
      // Ignore if column already exists
    }

    try {
      await client.execute(
        `INSERT OR REPLACE INTO users (id, name, email, password_hash, role) VALUES 
         ((SELECT id FROM users WHERE email = 'dev.parceluncle@gmail.com' OR email = 'admin@specs.com' LIMIT 1), 
          'Specs Admin', 'dev.parceluncle@gmail.com', '$2a$10$u61PmqIpLYEY.aYKYcR9CeFviIrFVj7az.rRQr4tCXYrR4dgN/Uii', 'admin')`
      );
      console.log('Migration: Seeded super administrator dev.parceluncle@gmail.com.');
    } catch (adminErr) {
      console.warn('Migration warning (super admin seed):', adminErr.message);
    }

    // Coupons table migration
    try {
      await client.execute(`CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL DEFAULT 'percentage',
        discount_value REAL NOT NULL,
        expiry_date TEXT DEFAULT NULL,
        max_uses INTEGER DEFAULT NULL,
        times_used INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )`);
      console.log('Migration: coupons table ready.');
    } catch (_) {}

    // Admin activity log table migration
    try {
      await client.execute(`CREATE TABLE IF NOT EXISTS admin_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_email TEXT NOT NULL,
        action_type TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`);
      console.log('Migration: admin_activity_log table ready.');
    } catch (_) {}

    // 10 new e-commerce features migrations:
    try {
      await client.execute("ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 0");
      console.log('Migration: Added loyalty_points to users table.');
    } catch (_) {}

    try {
      await client.execute("ALTER TABLE users ADD COLUMN referral_code TEXT DEFAULT NULL");
      console.log('Migration: Added referral_code to users table.');
    } catch (_) {}

    try {
      await client.execute("ALTER TABLE orders ADD COLUMN lens_type TEXT DEFAULT NULL");
      console.log('Migration: Added lens_type to orders table.');
    } catch (_) {}

    try {
      await client.execute("ALTER TABLE orders ADD COLUMN lens_price REAL DEFAULT 0.0");
      console.log('Migration: Added lens_price to orders table.');
    } catch (_) {}

    try {
      await client.execute("ALTER TABLE orders ADD COLUMN prescription_details TEXT DEFAULT NULL");
      console.log('Migration: Added prescription_details to orders table.');
    } catch (_) {}

    try {
      await client.execute("ALTER TABLE orders ADD COLUMN tracking_comments TEXT DEFAULT NULL");
      console.log('Migration: Added tracking_comments to orders table.');
    } catch (_) {}

    try {
      await client.execute(`CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        reply_message TEXT DEFAULT NULL,
        replied_at TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`);
      console.log('Migration: contact_messages table ready.');
    } catch (_) {}

    // Migration: Add phone column to users table
    try {
      await client.execute("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT NULL");
      console.log('Migration: Added phone column to users table.');
    } catch (_) {}

    // Migration: Create otps table for phone/email verification codes
    try {
      await client.execute(`CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT NULL,
        email TEXT NOT NULL,
        phone TEXT DEFAULT NULL,
        password_hash TEXT DEFAULT NULL,
        otp_code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        verified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )`);
      console.log('Migration: otps table ready.');
    } catch (_) {}

    try {
      await client.execute("ALTER TABLE otps ADD COLUMN name TEXT DEFAULT NULL");
    } catch (_) {}
    try {
      await client.execute("ALTER TABLE otps ADD COLUMN password_hash TEXT DEFAULT NULL");
    } catch (_) {}

    // Run seed AFTER schema is fully applied
    const seedPath = path.join(__dirname, 'seed.js');
    if (fs.existsSync(seedPath)) {
      // Clear require cache so re-starts pick up latest seed
      delete require.cache[require.resolve(seedPath)];
      const seed = require(seedPath);
      await seed(query);
      console.log('Seed data applied.');
    }
  } catch (err) {
    console.error('Database initialisation error:', err);
    throw err;
  }
};

module.exports = { query, transaction, initDb, client };
