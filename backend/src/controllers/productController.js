const db = require('../config/db');
const { defaultProducts } = require('../config/defaultSeedData');

// Get All Products with Filters & Recommendation Logic
const getProducts = async (req, res) => {
  const { category, gender, frame_shape, price_min, price_max, search, face_shape, sort, limit } = req.query;

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
      sql += ` AND LOWER(p.category) = LOWER(?)`;
      params.push(category);
    }

    if (gender) {
      sql += ` AND (LOWER(p.gender) = LOWER(?) OR p.gender = 'Unisex')`;
      params.push(gender);
    }

    if (frame_shape && !face_shape) {
      const shapes = Array.isArray(frame_shape) ? frame_shape : [frame_shape];
      const placeholders = shapes.map(() => '?').join(',');
      sql += ` AND p.frame_shape IN (${placeholders})`;
      params.push(...shapes);
    }

    if (face_shape) {
      const mappingRes = await db.query(
        'SELECT recommended_frame_shapes FROM frame_shape_mapping WHERE LOWER(face_shape) = ?',
        [face_shape.toLowerCase().trim()]
      );
      if (mappingRes.rows.length > 0) {
        let recommendedShapes = mappingRes.rows[0].recommended_frame_shapes;
        if (typeof recommendedShapes === 'string') {
          try { recommendedShapes = JSON.parse(recommendedShapes); } catch (_) { recommendedShapes = []; }
        }
        if (Array.isArray(recommendedShapes) && recommendedShapes.length > 0) {
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

    if (search) {
      sql += ` AND (LOWER(p.name) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?))`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY p.id`;

    // Sorting order
    if (sort === 'price-low') {
      sql += ` ORDER BY p.price ASC`;
    } else if (sort === 'price-high') {
      sql += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating') {
      sql += ` ORDER BY average_rating DESC, review_count DESC`;
    } else if (sort === 'featured') {
      sql += ` ORDER BY p.id ASC`;
    } else {
      sql += ` ORDER BY p.id ASC`;
    }

    if (limit && !isNaN(parseInt(limit))) {
      sql += ` LIMIT ${parseInt(limit)}`;
    }

    const result = await db.query(sql, params);
    let list = result.rows;

    // Fallback to in-memory seed catalog if DB rows are empty
    if (!list || list.length === 0) {
      list = defaultProducts.filter(p => {
        if (category && p.category.toLowerCase() !== String(category).toLowerCase()) return false;
        if (gender && p.gender.toLowerCase() !== String(gender).toLowerCase() && p.gender !== 'Unisex') return false;
        if (search && !p.name.toLowerCase().includes(String(search).toLowerCase())) return false;
        return true;
      });
    }

    // Ensure image_urls is always a valid non-empty array
    const sanitizedList = list.map(item => {
      let imgs = item.image_urls;
      if (typeof imgs === 'string') {
        try { imgs = JSON.parse(imgs); } catch (_) { imgs = [imgs]; }
      }
      if (!Array.isArray(imgs) || imgs.length === 0) {
        imgs = ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'];
      }
      return {
        ...item,
        image_urls: imgs
      };
    });

    res.json(sanitizedList);
  } catch (err) {
    console.error('Get products error:', err);
    res.json(defaultProducts);
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

    let product = productResult.rows[0];

    if (!product) {
      product = defaultProducts.find(p => String(p.id) === String(id)) || defaultProducts[0];
    }

    const reviewsResult = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    if (product) {
      let imgs = product.image_urls;
      if (typeof imgs === 'string') {
        try { imgs = JSON.parse(imgs); } catch (_) { imgs = [imgs]; }
      }
      if (!Array.isArray(imgs) || imgs.length === 0) {
        imgs = ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'];
      }
      product.image_urls = imgs;
    }

    product.reviews = reviewsResult.rows || [];

    res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    const product = defaultProducts.find(p => String(p.id) === String(id)) || defaultProducts[0];
    res.json(product);
  }
};

// Get Face Shape Recommendations
const getRecommendations = async (req, res) => {
  const { face_shape } = req.params;

  try {
    const mappingRes = await db.query(
      'SELECT recommended_frame_shapes FROM frame_shape_mapping WHERE LOWER(face_shape) = ?',
      [face_shape.toLowerCase().trim()]
    );

    let recommendedShapes = ['Rectangle', 'Square', 'Wayfarer', 'Aviator'];
    if (mappingRes.rows.length > 0) {
      let shapesVal = mappingRes.rows[0].recommended_frame_shapes;
      if (typeof shapesVal === 'string') {
        try { shapesVal = JSON.parse(shapesVal); } catch (_) { shapesVal = []; }
      }
      if (Array.isArray(shapesVal) && shapesVal.length > 0) {
        recommendedShapes = shapesVal;
      }
    }

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

    if (!products || products.length === 0) {
      products = defaultProducts.slice(0, 4);
    }

    const sanitizedProducts = products.map(item => {
      let imgs = item.image_urls;
      if (typeof imgs === 'string') {
        try { imgs = JSON.parse(imgs); } catch (_) { imgs = [imgs]; }
      }
      if (!Array.isArray(imgs) || imgs.length === 0) {
        imgs = ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'];
      }
      return { ...item, image_urls: imgs };
    });

    res.json({
      face_shape,
      recommended_frame_shapes: recommendedShapes,
      products: sanitizedProducts
    });
  } catch (err) {
    console.error('Get recommendations error:', err);
    res.json({
      face_shape,
      recommended_frame_shapes: ['Rectangle', 'Square', 'Wayfarer'],
      products: defaultProducts.slice(0, 4)
    });
  }
};

// Get Distinct Filter Options for Frontend UI Sidebar
const getFilterOptions = async (req, res) => {
  try {
    const shapesRes    = await db.query('SELECT DISTINCT frame_shape FROM products ORDER BY frame_shape');
    const categoriesRes= await db.query('SELECT DISTINCT category FROM products ORDER BY category');
    const gendersRes   = await db.query('SELECT DISTINCT gender FROM products ORDER BY gender');
    const priceRangeRes= await db.query('SELECT MIN(price) as min_price, MAX(price) as max_price FROM products');

    const shapes = shapesRes.rows.map(r => r.frame_shape).filter(Boolean);
    const categories = categoriesRes.rows.map(r => r.category).filter(Boolean);
    const genders = gendersRes.rows.map(r => r.gender).filter(Boolean);

    res.json({
      frame_shapes: shapes.length > 0 ? shapes : ['Rectangle', 'Round', 'Cat-Eye', 'Wayfarer', 'Aviator', 'Square', 'Oval'],
      categories:   categories.length > 0 ? categories : ['Eyeglasses', 'Sunglasses'],
      genders:      genders.length > 0 ? genders : ['Men', 'Women', 'Unisex', 'Kids'],
      price_range:  priceRangeRes.rows[0]?.max_price ? priceRangeRes.rows[0] : { min_price: 1500, max_price: 10000 }
    });
  } catch (err) {
    console.error('Get filter options error:', err);
    res.json({
      frame_shapes: ['Rectangle', 'Round', 'Cat-Eye', 'Wayfarer', 'Aviator', 'Square', 'Oval'],
      categories:   ['Eyeglasses', 'Sunglasses'],
      genders:      ['Men', 'Women', 'Unisex', 'Kids'],
      price_range:  { min_price: 1500, max_price: 10000 }
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getRecommendations,
  getFilterOptions
};
