const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url:       process.env.TURSO_URL   || 'file:local.db',
  authToken: process.env.TURSO_TOKEN || undefined,
});

async function run() {
  try {
    console.log('Connecting to database...');
    
    try {
      await client.execute("ALTER TABLE orders ADD COLUMN tracking_id TEXT DEFAULT NULL");
      console.log('Migration: Created tracking_id column.');
    } catch (e) {
      console.log('Column tracking_id already exists or error:', e.message);
    }

    const result = await client.execute("SELECT id, tracking_id FROM orders");
    console.log(`Found total ${result.rows.length} orders in database.`);

    let updatedCount = 0;
    for (const row of result.rows) {
      const orderId = row.id !== undefined ? row.id : row[0];
      const trackingId = row.tracking_id !== undefined ? row.tracking_id : row[1];

      // If tracking ID is null, or does not start with LS, or doesn't have 12 characters (LS + 10 digits)
      if (!trackingId || !trackingId.startsWith('LS') || trackingId.length !== 12) {
        const newTid = 'LS' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
        await client.execute({
          sql: "UPDATE orders SET tracking_id = ? WHERE id = ?",
          args: [newTid, orderId]
        });
        console.log(`Updated Order #${orderId}: null/invalid -> ${newTid}`);
        updatedCount++;
      } else {
        console.log(`Order #${orderId} already has valid tracking ID: ${trackingId}`);
      }
    }

    console.log(`SUCCESS: Backfilled ${updatedCount} orders with new tracking IDs.`);
  } catch (err) {
    console.error('Error running backfill:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
