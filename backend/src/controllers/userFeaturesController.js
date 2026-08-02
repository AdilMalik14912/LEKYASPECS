const db = require('../config/db');

// 1. Wishlist Sync APIs
exports.syncWishlist = async (req, res) => {
  const userId = req.user.id;
  const { productIds } = req.body;
  if (!Array.isArray(productIds)) {
    return res.status(400).json({ message: 'productIds must be an array' });
  }

  try {
    for (const pid of productIds) {
      await db.query(
        `INSERT OR IGNORE INTO user_wishlists (user_id, product_id) VALUES (?, ?)`,
        [userId, pid]
      );
    }
    const result = await db.query(
      `SELECT product_id FROM user_wishlists WHERE user_id = ?`,
      [userId]
    );
    const syncedIds = result.rows.map(r => r.product_id);
    res.json({ message: 'Wishlist synced successfully', wishlist: syncedIds });
  } catch (err) {
    console.error('syncWishlist error:', err);
    res.status(500).json({ message: 'Error syncing wishlist' });
  }
};

exports.getUserWishlist = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT p.* FROM user_wishlists w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getUserWishlist error:', err);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
};

// 2. Prescription Studio APIs
exports.savePrescription = async (req, res) => {
  const userId = req.user.id;
  const {
    prescription_name,
    left_eye_sph, right_eye_sph,
    left_eye_cyl, right_eye_cyl,
    left_eye_axis, right_eye_axis,
    pd, prescription_image
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO user_prescriptions 
       (user_id, prescription_name, left_eye_sph, right_eye_sph, left_eye_cyl, right_eye_cyl, left_eye_axis, right_eye_axis, pd, prescription_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [
        userId,
        prescription_name || 'My Optical Prescription',
        left_eye_sph || '0.00', right_eye_sph || '0.00',
        left_eye_cyl || '0.00', right_eye_cyl || '0.00',
        left_eye_axis || '0', right_eye_axis || '0',
        pd || '63', prescription_image || null
      ]
    );
    res.json({ message: 'Prescription saved successfully!', prescription: result.rows[0] });
  } catch (err) {
    console.error('savePrescription error:', err);
    res.status(500).json({ message: 'Error saving prescription' });
  }
};

exports.getUserPrescriptions = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT * FROM user_prescriptions WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getUserPrescriptions error:', err);
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
};

// 3. Restock Notification Subscription API
exports.subscribeRestock = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Valid email address is required' });
  }

  try {
    await db.query(
      `INSERT OR IGNORE INTO restock_subscriptions (product_id, email) VALUES (?, ?)`,
      [id, email]
    );
    res.json({ message: 'Restock notification subscribed successfully! You will get an email alert as soon as this item is back in stock.' });
  } catch (err) {
    console.error('subscribeRestock error:', err);
    res.status(500).json({ message: 'Error registering restock subscription' });
  }
};

// 4. Address Book APIs
exports.getUserAddresses = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getUserAddresses error:', err);
    res.status(500).json({ message: 'Error fetching saved addresses' });
  }
};

exports.saveUserAddress = async (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

  if (!full_name || !phone || !address_line1 || !city || !state || !pincode) {
    return res.status(400).json({ message: 'Full name, phone, address line 1, city, state and pincode are required' });
  }

  try {
    if (is_default) {
      await db.query(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`, [userId]);
    }

    const result = await db.query(
      `INSERT INTO user_addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [userId, full_name, phone, address_line1, address_line2 || null, city, state, pincode, is_default ? 1 : 0]
    );
    res.json({ message: 'Address saved successfully', address: result.rows[0] });
  } catch (err) {
    console.error('saveUserAddress error:', err);
    res.status(500).json({ message: 'Error saving address' });
  }
};

exports.deleteUserAddress = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM user_addresses WHERE id = ? AND user_id = ?`, [id, userId]);
    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error('deleteUserAddress error:', err);
    res.status(500).json({ message: 'Error deleting address' });
  }
};

// 5. Search Analytics Logging API
exports.logSearchQuery = async (req, res) => {
  const { query_text, results_count } = req.body;
  const userId = req.user ? req.user.id : null;
  if (!query_text) return res.status(400).json({ message: 'query_text is required' });

  try {
    await db.query(
      `INSERT INTO search_logs (query_text, user_id, results_count) VALUES (?, ?, ?)`,
      [query_text.trim(), userId, results_count || 0]
    );
    res.json({ message: 'Search logged successfully' });
  } catch (err) {
    console.error('logSearchQuery error:', err);
    res.status(500).json({ message: 'Error logging search' });
  }
};

// 6. Spin & Win VIP Reward Claim API
exports.claimSpinReward = async (req, res) => {
  const userId = req.user.id;
  const { prize_title, discount_code } = req.body;
  if (!discount_code) return res.status(400).json({ message: 'discount_code is required' });

  try {
    // Check if coupon exists, or auto-create it
    const existing = await db.query(`SELECT * FROM coupons WHERE code = ?`, [discount_code]);
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO coupons (code, discount_type, discount_value, max_uses, is_active) VALUES (?, 'percentage', 15, 100, 1)`,
        [discount_code]
      );
    }
    // Add 100 loyalty points bonus to user for spinning
    await db.query(`UPDATE users SET loyalty_points = loyalty_points + 100 WHERE id = ?`, [userId]);
    res.json({
      message: `🎉 Reward claimed! You won ${prize_title || '15% Off'}! Code ${discount_code} activated + 100 VIP Loyalty Points added!`,
      coupon_code: discount_code
    });
  } catch (err) {
    console.error('claimSpinReward error:', err);
    res.status(500).json({ message: 'Error claiming reward' });
  }
};
