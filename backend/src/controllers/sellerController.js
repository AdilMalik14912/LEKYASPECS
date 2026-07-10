const db = require('../config/db');

// 1. Get all products with stock info for seller view
const getSellerProducts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, description, price, category, gender, frame_shape, image_urls, stock, style_tags, created_at
       FROM products ORDER BY stock ASC, created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Seller getProducts error:', err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// 2. Get pending/processing orders for seller (order management)
const getSellerOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_address,
              o.lens_type, o.lens_price, o.tracking_comments,
              o.assigned_delivery_agent_id, o.delivery_notes,
              u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
              da.name as delivery_agent_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN users da ON o.assigned_delivery_agent_id = da.id
       ORDER BY o.created_at DESC`
    );

    // Fetch items for each order
    const orders = await Promise.all(result.rows.map(async (order) => {
      const itemsRes = await db.query(
        `SELECT oi.quantity, oi.price, p.name, p.image_urls, p.frame_shape
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      return { ...order, items: itemsRes.rows };
    }));

    res.json(orders);
  } catch (err) {
    console.error('Seller getOrders error:', err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// 3. Update order status (seller can mark orders as Processing/Shipped)
const updateSellerOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, tracking_comments } = req.body;

  const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Paid'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    await db.query(
      'UPDATE orders SET status = ?, tracking_comments = ? WHERE id = ?',
      [status, tracking_comments || null, id]
    );
    res.json({ message: `Order #${id} updated to ${status}` });
  } catch (err) {
    console.error('Seller updateOrderStatus error:', err);
    res.status(500).json({ message: 'Server error updating order' });
  }
};

// 4. Get seller dashboard stats
const getSellerStats = async (req, res) => {
  try {
    const totalProductsRes = await db.query('SELECT COUNT(*) as total FROM products');
    const lowStockRes = await db.query('SELECT COUNT(*) as count FROM products WHERE stock <= 5 AND stock > 0');
    const outOfStockRes = await db.query('SELECT COUNT(*) as count FROM products WHERE stock = 0');
    const pendingOrdersRes = await db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'");
    const processingOrdersRes = await db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Processing'");
    const shippedOrdersRes = await db.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Shipped'");
    const totalRevenueRes = await db.query("SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status = 'Paid'");
    const lowStockProductsRes = await db.query(
      'SELECT id, name, stock, price, image_urls FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 8'
    );
    const recentOrdersRes = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, u.name as customer_name
       FROM orders o LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 5`
    );

    res.json({
      totalProducts: totalProductsRes.rows[0]?.total || 0,
      lowStock: lowStockRes.rows[0]?.count || 0,
      outOfStock: outOfStockRes.rows[0]?.count || 0,
      pendingOrders: pendingOrdersRes.rows[0]?.count || 0,
      processingOrders: processingOrdersRes.rows[0]?.count || 0,
      shippedOrders: shippedOrdersRes.rows[0]?.count || 0,
      totalRevenue: totalRevenueRes.rows[0]?.revenue || 0,
      lowStockProducts: lowStockProductsRes.rows,
      recentOrders: recentOrdersRes.rows
    });
  } catch (err) {
    console.error('Seller getStats error:', err);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// 5. Assign delivery agent to an order
const assignDeliveryAgent = async (req, res) => {
  const { id } = req.params;
  const { delivery_agent_id } = req.body;

  try {
    // Verify agent exists and has delivery role
    const agentRes = await db.query(
      "SELECT id, name, email FROM users WHERE id = ? AND role = 'delivery'",
      [delivery_agent_id]
    );
    if (agentRes.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery agent not found' });
    }

    await db.query(
      'UPDATE orders SET assigned_delivery_agent_id = ?, status = ? WHERE id = ?',
      [delivery_agent_id, 'Shipped', id]
    );

    res.json({ message: `Order #${id} assigned to ${agentRes.rows[0].name}` });
  } catch (err) {
    console.error('Assign delivery agent error:', err);
    res.status(500).json({ message: 'Server error assigning delivery agent' });
  }
};

// 6. Get all delivery agents list
const getDeliveryAgents = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE role = 'delivery' ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get delivery agents error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSellerProducts,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerStats,
  assignDeliveryAgent,
  getDeliveryAgents
};
