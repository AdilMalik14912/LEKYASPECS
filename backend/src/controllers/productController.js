const db = require('../config/db');

// Get All Products with Filters & Recommendation Logic
const getProducts = async (req, res) => {
  const { category, gender, frame_shape, price_min, price_max, search, face_shape } = req.query;

  try {
    let sql = `
      SELECT p.id, p.name, p.description, p.price, p.category, p.gender,
             p.frame_shape, p.image_urls, p.stock, p.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ` AND p.category = ?`;
      params.push(category);
    }

    if (gender) {
      sql += ` AND (p.gender = ? OR p.gender = 'Unisex')`;
      params.push(gender);
    }

    // Frame shape filter (single value; face_shape mapping handled below)
    if (frame_shape && !face_shape) {
      const shapes = Array.isArray(frame_shape) ? frame_shape : [frame_shape];
      // SQLite doesn't support ANY(array), use IN (?,?,...)
      const placeholders = shapes.map(() => '?').join(',');
      sql += ` AND p.frame_shape IN (${placeholders})`;
      params.push(...shapes);
    }

    // Face shape recommendation mapping
    if (face_shape) {
      const mappingRes = await db.query(
        'SELECT recommended_frame_shapes FROM frame_shape_mapping WHERE face_shape = ?',
        [face_shape.toLowerCase().trim()]
      );
      if (mappingRes.rows.length > 0) {
        const recommendedShapes = Array.isArray(mappingRes.rows[0].recommended_frame_shapes)
          ? mappingRes.rows[0].recommended_frame_shapes
          : JSON.parse(mappingRes.rows[0].recommended_frame_shapes || '[]');
        if (recommendedShapes.length > 0) {
          const placeholders = recommendedShapes.map(() => '?').join(',');
          sql += ` AND p.frame_shape IN (${placeholders})`;
          params.push(...recommendedShapes);
        }
      }
    }

    if (price_min) {
      sql += ` AND p.price >= ?`;
      params.push(parseFloat(price_min));
    }
    if (price_max) {
      sql += ` AND p.price <= ?`;
      params.push(parseFloat(price_max));
    }

    // Text search — SQLite uses LIKE (case-insensitive for ASCII by default)
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY p.id ORDER BY p.id DESC`;

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// Get Product by ID (with details and reviews list)
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const productResult = await db.query(
      `SELECT p.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count
       FROM products p
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Fetch individual reviews
    const reviewsResult = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    product.reviews = reviewsResult.rows;

    res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ message: 'Server error fetching product details' });
  }
};

// Get Face Shape Recommendations
const getRecommendations = async (req, res) => {
  const { face_shape } = req.params;

  try {
    const mappingRes = await db.query(
      'SELECT recommended_frame_shapes FROM frame_shape_mapping WHERE face_shape = ?',
      [face_shape.toLowerCase().trim()]
    );

    if (mappingRes.rows.length === 0) {
      return res.status(404).json({ message: 'No recommendations found for this face shape' });
    }

    const recommendedShapes = Array.isArray(mappingRes.rows[0].recommended_frame_shapes)
      ? mappingRes.rows[0].recommended_frame_shapes
      : JSON.parse(mappingRes.rows[0].recommended_frame_shapes || '[]');

    let products = [];
    if (recommendedShapes.length > 0) {
      const placeholders = recommendedShapes.map(() => '?').join(',');
      const productsRes = await db.query(
        `SELECT p.*, COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as review_count
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.frame_shape IN (${placeholders})
         GROUP BY p.id
         LIMIT 6`,
        recommendedShapes
      );
      products = productsRes.rows;
    }

    res.json({
      face_shape,
      recommended_frame_shapes: recommendedShapes,
      products
    });
  } catch (err) {
    console.error('Get recommendations error:', err);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
};

// Get Distinct Filter Options for Frontend UI Sidebar
const getFilterOptions = async (req, res) => {
  try {
    const shapesRes    = await db.query('SELECT DISTINCT frame_shape FROM products ORDER BY frame_shape');
    const categoriesRes= await db.query('SELECT DISTINCT category FROM products ORDER BY category');
    const gendersRes   = await db.query('SELECT DISTINCT gender FROM products ORDER BY gender');
    const priceRangeRes= await db.query('SELECT MIN(price) as min_price, MAX(price) as max_price FROM products');

    res.json({
      frame_shapes: shapesRes.rows.map(r => r.frame_shape),
      categories:   categoriesRes.rows.map(r => r.category),
      genders:      gendersRes.rows.map(r => r.gender),
      price_range:  priceRangeRes.rows[0]
    });
  } catch (err) {
    console.error('Get filter options error:', err);
    res.status(500).json({ message: 'Server error fetching filter options' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getRecommendations,
  getFilterOptions
};
