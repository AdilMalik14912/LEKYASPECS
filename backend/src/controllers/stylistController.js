const db = require('../config/db');

// Helper to get store setting with default fallback
const getSetting = async (key, defaultVal = '') => {
  try {
    const res = await db.query('SELECT value FROM store_settings WHERE key = ?', [key]);
    if (res.rows.length > 0) {
      return res.rows[0].value;
    }
    return defaultVal;
  } catch (err) {
    console.error(`Error getting store setting ${key}:`, err);
    return defaultVal;
  }
};

// Helper to set store setting
const setSetting = async (key, value) => {
  try {
    await db.query(
      'INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)',
      [key, typeof value === 'object' ? JSON.stringify(value) : String(value)]
    );
    return true;
  } catch (err) {
    console.error(`Error setting store setting ${key}:`, err);
    throw err;
  }
};

// 1. Get products for Stylist Panel (includes style_tags)
const getProducts = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, category, frame_shape, image_urls, style_tags FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Stylist getProducts error:', err);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};

// 2. Update Style Tags for a Product
const updateProductTags = async (req, res) => {
  const { id } = req.params;
  const { style_tags } = req.body; // Expect array of strings or string
  try {
    const tagsStr = Array.isArray(style_tags) ? JSON.stringify(style_tags) : style_tags;
    await db.query('UPDATE products SET style_tags = ? WHERE id = ?', [tagsStr, id]);
    res.json({ message: 'Style tags updated successfully' });
  } catch (err) {
    console.error('Stylist updateProductTags error:', err);
    res.status(500).json({ message: 'Failed to update style tags' });
  }
};

// 3. Get Lookbook Collections
const getLookbook = async (req, res) => {
  try {
    const data = await getSetting('stylist_lookbook', '[]');
    let parsed = [];
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (_) {
      parsed = [];
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get lookbook data' });
  }
};

// 4. Update Lookbook Collections
const updateLookbook = async (req, res) => {
  const { lookbook } = req.body;
  try {
    await setSetting('stylist_lookbook', lookbook);
    res.json({ message: 'Lookbook collections updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save lookbook data' });
  }
};

// 5. Get Content/Promo Calendar
const getCalendar = async (req, res) => {
  try {
    const data = await getSetting('stylist_calendar', '[]');
    let parsed = [];
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (_) {
      parsed = [];
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get calendar data' });
  }
};

// 6. Update Content/Promo Calendar
const updateCalendar = async (req, res) => {
  const { calendar } = req.body;
  try {
    await setSetting('stylist_calendar', calendar);
    res.json({ message: 'Calendar updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save calendar data' });
  }
};

// 7. Get Spotlight Featured Products list
const getSpotlight = async (req, res) => {
  try {
    const data = await getSetting('stylist_spotlight', '[]');
    let parsed = [];
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (_) {
      parsed = [];
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get spotlight data' });
  }
};

// 8. Update Spotlight Featured Products list
const updateSpotlight = async (req, res) => {
  const { spotlight } = req.body;
  try {
    await setSetting('stylist_spotlight', spotlight);
    res.json({ message: 'Spotlight products updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save spotlight data' });
  }
};

// 9. Get Color Stories (seasonal color groups)
const getColorStories = async (req, res) => {
  try {
    const data = await getSetting('stylist_color_stories', '[]');
    let parsed = [];
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (_) {
      parsed = [];
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get color stories' });
  }
};

// 10. Update Color Stories
const updateColorStories = async (req, res) => {
  const { color_stories } = req.body;
  try {
    await setSetting('stylist_color_stories', color_stories);
    res.json({ message: 'Color stories saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save color stories' });
  }
};

// 11. Get Advisor Frame Shapes Mapping
const getAdvisor = async (req, res) => {
  try {
    const result = await db.query('SELECT face_shape, recommended_frame_shapes FROM frame_shape_mapping');
    res.json(result.rows);
  } catch (err) {
    console.error('Stylist getAdvisor error:', err);
    res.status(500).json({ message: 'Failed to retrieve face shape advisor map' });
  }
};

// 12. Update Advisor Frame Shapes Mapping
const updateAdvisor = async (req, res) => {
  const { face_shape, recommended_frame_shapes } = req.body;
  try {
    const shapesStr = Array.isArray(recommended_frame_shapes) 
      ? JSON.stringify(recommended_frame_shapes) 
      : recommended_frame_shapes;
    
    await db.query(
      'INSERT OR REPLACE INTO frame_shape_mapping (face_shape, recommended_frame_shapes) VALUES (?, ?)',
      [face_shape, shapesStr]
    );
    res.json({ message: 'Face shape mapping updated successfully' });
  } catch (err) {
    console.error('Stylist updateAdvisor error:', err);
    res.status(500).json({ message: 'Failed to update face shape mappings' });
  }
};

// 13. Get All Reviews for spotlight curation
const getReviews = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, u.name as user_name, u.email as user_email, p.name as product_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Stylist getReviews error:', err);
    res.status(500).json({ message: 'Failed to retrieve reviews' });
  }
};

// 14. Update Review Spotlight Status
const toggleReviewSpotlight = async (req, res) => {
  const { id } = req.params;
  const { spotlight } = req.body; // 0 or 1
  try {
    await db.query('UPDATE reviews SET spotlight = ? WHERE id = ?', [spotlight ? 1 : 0, id]);
    res.json({ message: 'Review spotlight status updated successfully' });
  } catch (err) {
    console.error('Stylist toggleReviewSpotlight error:', err);
    res.status(500).json({ message: 'Failed to toggle review spotlight' });
  }
};

// 15. Get Tone Profile (Brand Voice Config)
const getToneProfile = async (req, res) => {
  try {
    const defaultProfile = JSON.stringify({
      keywords: ["elegant", "luxury", "avant-garde", "hand-crafted", "premium", "sophisticated", "lightweight"],
      banned: ["cheap", "normal", "basic", "local", "okay"],
      guidelines: "Keep product descriptions luxurious, focusing on craftsmanship, premium materials (like Italian acetate/titanium), and how it elevates style."
    });
    const data = await getSetting('stylist_tone_profile', defaultProfile);
    let parsed = {};
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (_) {
      parsed = JSON.parse(defaultProfile);
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get tone profile' });
  }
};

// 16. Update Tone Profile
const updateToneProfile = async (req, res) => {
  const { tone_profile } = req.body;
  try {
    await setSetting('stylist_tone_profile', tone_profile);
    res.json({ message: 'Tone profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save tone profile' });
  }
};

module.exports = {
  getProducts,
  updateProductTags,
  getLookbook,
  updateLookbook,
  getCalendar,
  updateCalendar,
  getSpotlight,
  updateSpotlight,
  getColorStories,
  updateColorStories,
  getAdvisor,
  updateAdvisor,
  getReviews,
  toggleReviewSpotlight,
  getToneProfile,
  updateToneProfile
};
