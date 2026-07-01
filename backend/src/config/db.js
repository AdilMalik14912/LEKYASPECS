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
