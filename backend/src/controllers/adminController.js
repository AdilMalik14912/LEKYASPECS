const db = require('../config/db');

// 1. Get Dashboard Analytics / Stats
const getDashboardStats = async (req, res) => {
  try {
    // Total revenue
    const revenueRes = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total_sales FROM orders WHERE status = 'Paid'"
    );

    // Total orders count
    const ordersCountRes = await db.query("SELECT COUNT(*) as total_orders FROM orders");

    // Total customers count
    const usersCountRes = await db.query(
      "SELECT COUNT(*) as total_customers FROM users WHERE email != 'admin@specs.com'"
    );

    // Low stock products warning (stock <= 5)
    const lowStockRes = await db.query(
      "SELECT id, name, stock, price FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 5"
    );

    // Sales by category
    const categorySalesRes = await db.query(
      `SELECT p.category, SUM(oi.quantity) as items_sold, SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'Paid'
       GROUP BY p.category`
    );

    // Top Selling Products
    const topProductsRes = await db.query(
      `SELECT p.id, p.name, p.price, p.frame_shape, p.image_urls,
              SUM(oi.quantity) as units_sold, SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'Paid'
       GROUP BY p.id, p.name, p.price, p.frame_shape, p.image_urls
       ORDER BY units_sold DESC
       LIMIT 5`
    );

    // 7-Day Sales Trend (SQLite date functions)
    const salesTrendRes = await db.query(
      `SELECT strftime('%Y-%m-%d', created_at) as date,
              SUM(total_amount) as sales,
              COUNT(*) as orders
       FROM orders
       WHERE status = 'Paid'
         AND created_at >= datetime('now', '-7 days')
       GROUP BY strftime('%Y-%m-%d', created_at)
       ORDER BY date ASC`
    );

    // Normalise image for top products (first image from JSON array)
    const topProducts = topProductsRes.rows.map(p => {
      let img = p.image_urls;
      if (Array.isArray(img)) img = img[0];
      else if (typeof img === 'string' && img.startsWith('[')) {
        try { img = JSON.parse(img)[0]; } catch (_) {}
      }
      return { ...p, image: img };
    });

    res.json({
      metrics: {
        total_sales:     parseFloat(revenueRes.rows[0].total_sales)     || 0,
        total_orders:    parseInt(ordersCountRes.rows[0].total_orders)   || 0,
        total_customers: parseInt(usersCountRes.rows[0].total_customers) || 0
      },
      low_stock_alerts:      lowStockRes.rows,
      category_distribution: categorySalesRes.rows,
      top_products:          topProducts,
      sales_trend:           salesTrendRes.rows
    });
  } catch (err) {
    console.error('Get admin stats error:', err);
    res.status(500).json({ message: 'Server error retrieving analytics data' });
  }
};

// 2. Get All Orders (Admin version)
const getAdminOrders = async (req, res) => {
  try {
    const ordersRes = await db.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(ordersRes.rows);
  } catch (err) {
    console.error('Get admin orders error:', err);
    res.status(500).json({ message: 'Server error retrieving orders' });
  }
};

// 3. Update Order Status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const result = await db.query('SELECT * FROM orders WHERE id = ?', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order: result.rows[0] });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

// 4. Get All Customers (Admin version)
const getAdminCustomers = async (req, res) => {
  try {
    const usersRes = await db.query(
      `SELECT u.id, u.name, u.email, u.face_shape, u.created_at,
              (SELECT COUNT(*) FROM orders WHERE user_id = u.id AND status = 'Paid') as paid_orders_count,
              (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = u.id AND status = 'Paid') as total_spend
       FROM users u
       WHERE u.email != 'admin@specs.com'
       ORDER BY u.created_at DESC`
    );
    res.json(usersRes.rows);
  } catch (err) {
    console.error('Get admin customers error:', err);
    res.status(500).json({ message: 'Server error retrieving customers' });
  }
};

// 5. Add Product
const addProduct = async (req, res) => {
  const { name, description, price, category, gender, frame_shape, image_urls, stock } = req.body;

  if (!name || !price || !category || !gender || !frame_shape || !image_urls || image_urls.length === 0) {
    return res.status(400).json({ message: 'All product fields are required' });
  }

  try {
    // Store image_urls as JSON string
    const imageUrlsStr = Array.isArray(image_urls) ? JSON.stringify(image_urls) : image_urls;

    await db.query(
      `INSERT INTO products (name, description, price, category, gender, frame_shape, image_urls, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, parseFloat(price), category, gender, frame_shape, imageUrlsStr, parseInt(stock || '0')]
    );

    const newProduct = await db.query('SELECT * FROM products WHERE name = ? ORDER BY id DESC LIMIT 1', [name]);
    res.status(201).json({ message: 'Product created successfully', product: newProduct.rows[0] });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// 6. Update Product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, gender, frame_shape, image_urls, stock } = req.body;

  try {
    const imageUrlsStr = Array.isArray(image_urls) ? JSON.stringify(image_urls) : image_urls;

    await db.query(
      `UPDATE products
       SET name = ?, description = ?, price = ?, category = ?, gender = ?, frame_shape = ?, image_urls = ?, stock = ?
       WHERE id = ?`,
      [name, description, parseFloat(price), category, gender, frame_shape, imageUrlsStr, parseInt(stock || '0'), id]
    );

    const result = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: result.rows[0] });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// 7. Delete Product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully', id: parseInt(id) });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

// 8. Get Store CMS Settings (Public)
const getSettings = async (req, res) => {
  try {
    const result = await db.query('SELECT key, value FROM store_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: 'Server error retrieving store settings' });
  }
};

// 9. Update Store CMS Settings (Admin only)
const updateSettings = async (req, res) => {
  const { hero_title, hero_subtitle, hero_image, trending_title } = req.body;

  try {
    const entries = [
      ['hero_title',     hero_title     || ''],
      ['hero_subtitle',  hero_subtitle  || ''],
      ['hero_image',     hero_image     || ''],
      ['trending_title', trending_title || ''],
    ];

    for (const [key, value] of entries) {
      await db.query(
        `INSERT INTO store_settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, value]
      );
    }

    res.json({ message: 'Store settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Server error updating store settings' });
  }
};

module.exports = {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  addProduct,
  updateProduct,
  deleteProduct,
  getSettings,
  updateSettings
};
