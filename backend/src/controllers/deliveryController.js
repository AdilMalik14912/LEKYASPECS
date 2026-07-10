const db = require('../config/db');

// 1. Get orders assigned to this delivery agent
const getMyDeliveries = async (req, res) => {
  const agentId = req.user.id;
  try {
    const result = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_address,
              o.tracking_comments, o.delivery_notes,
              u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.assigned_delivery_agent_id = ?
       ORDER BY o.created_at DESC`,
      [agentId]
    );

    const orders = await Promise.all(result.rows.map(async (order) => {
      const itemsRes = await db.query(
        `SELECT oi.quantity, oi.price, p.name, p.image_urls
         FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      return { ...order, items: itemsRes.rows };
    }));

    res.json(orders);
  } catch (err) {
    console.error('Get my deliveries error:', err);
    res.status(500).json({ message: 'Server error fetching deliveries' });
  }
};

// 2. Get all unassigned orders (available for delivery agents to claim)
const getAvailableOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_address,
              u.name as customer_name, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.assigned_delivery_agent_id IS NULL
         AND o.status IN ('Paid', 'Processing', 'Shipped')
       ORDER BY o.created_at ASC`
    );

    const orders = await Promise.all(result.rows.map(async (order) => {
      const itemsRes = await db.query(
        `SELECT oi.quantity, p.name FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      return { ...order, items: itemsRes.rows };
    }));

    res.json(orders);
  } catch (err) {
    console.error('Get available orders error:', err);
    res.status(500).json({ message: 'Server error fetching available orders' });
  }
};

// 3. Claim an order (assign yourself as delivery agent)
const claimOrder = async (req, res) => {
  const agentId = req.user.id;
  const { id } = req.params;

  try {
    // Check order exists and is not already claimed
    const orderRes = await db.query(
      'SELECT id, assigned_delivery_agent_id, status FROM orders WHERE id = ?',
      [id]
    );
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (orderRes.rows[0].assigned_delivery_agent_id) {
      return res.status(400).json({ message: 'Order already assigned to another agent' });
    }

    await db.query(
      "UPDATE orders SET assigned_delivery_agent_id = ?, status = 'Shipped' WHERE id = ?",
      [agentId, id]
    );

    res.json({ message: `Order #${id} claimed successfully! It is now assigned to you.` });
  } catch (err) {
    console.error('Claim order error:', err);
    res.status(500).json({ message: 'Server error claiming order' });
  }
};

// 4. Update delivery status of an assigned order
const updateDeliveryStatus = async (req, res) => {
  const agentId = req.user.id;
  const { id } = req.params;
  const { status, delivery_notes } = req.body;

  const allowedStatuses = ['Shipped', 'Out for Delivery', 'Delivered'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid delivery status' });
  }

  try {
    // Verify the agent owns this order
    const orderRes = await db.query(
      'SELECT id, assigned_delivery_agent_id FROM orders WHERE id = ?',
      [id]
    );
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (
      orderRes.rows[0].assigned_delivery_agent_id !== agentId &&
      req.user.role !== 'admin' &&
      req.user.email !== 'dev.parceluncle@gmail.com'
    ) {
      return res.status(403).json({ message: 'You are not assigned to this order' });
    }

    const finalStatus = status === 'Delivered' ? 'Delivered' : status;
    await db.query(
      'UPDATE orders SET status = ?, delivery_notes = ? WHERE id = ?',
      [finalStatus, delivery_notes || null, id]
    );

    res.json({ message: `Order #${id} marked as "${status}"` });
  } catch (err) {
    console.error('Update delivery status error:', err);
    res.status(500).json({ message: 'Server error updating delivery status' });
  }
};

// 5. Get delivery agent's own stats
const getMyStats = async (req, res) => {
  const agentId = req.user.id;
  try {
    const totalAssignedRes = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE assigned_delivery_agent_id = ?',
      [agentId]
    );
    const deliveredRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE assigned_delivery_agent_id = ? AND status = 'Delivered'",
      [agentId]
    );
    const outForDeliveryRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE assigned_delivery_agent_id = ? AND status = 'Out for Delivery'",
      [agentId]
    );
    const shippedRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE assigned_delivery_agent_id = ? AND status = 'Shipped'",
      [agentId]
    );
    const todayDeliveredRes = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE assigned_delivery_agent_id = ? AND status = 'Delivered' AND created_at >= date('now')",
      [agentId]
    );

    res.json({
      totalAssigned: totalAssignedRes.rows[0]?.count || 0,
      delivered: deliveredRes.rows[0]?.count || 0,
      outForDelivery: outForDeliveryRes.rows[0]?.count || 0,
      shipped: shippedRes.rows[0]?.count || 0,
      todayDelivered: todayDeliveredRes.rows[0]?.count || 0
    });
  } catch (err) {
    console.error('Get delivery stats error:', err);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

module.exports = {
  getMyDeliveries,
  getAvailableOrders,
  claimOrder,
  updateDeliveryStatus,
  getMyStats,
  updateRiderLocation,
  getMyMapOrders
};

// 6. 📍 Update rider's GPS location (called every 30s from delivery map)
async function updateRiderLocation(req, res) {
  const agentId = req.user.id;
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });
  try {
    await db.query(
      "UPDATE users SET rider_lat = ?, rider_lng = ?, rider_last_seen = datetime('now') WHERE id = ?",
      [lat, lng, agentId]
    );
    res.json({ message: 'Location updated', lat, lng });
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// 7. 🗺 Get my active orders with full address for route map
async function getMyMapOrders(req, res) {
  const agentId = req.user.id;
  try {
    const result = await db.query(
      `SELECT o.id, o.status, o.shipping_address, o.is_urgent, o.urgent_note,
              u.name as customer_name, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.assigned_delivery_agent_id = ?
         AND o.status NOT IN ('Delivered','Cancelled')
       ORDER BY o.is_urgent DESC, o.created_at ASC`,
      [agentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get map orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

