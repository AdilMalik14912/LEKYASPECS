const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');
require('dotenv').config();

// Initialize Razorpay Client
const isDummyKey = process.env.RAZORPAY_KEY_ID === 'rzp_test_dummykey123' || !process.env.RAZORPAY_KEY_ID;

let razorpay = null;
if (!isDummyKey) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.error('Error initializing Razorpay, using mock fallback:', err.message);
  }
}

// 1. Create Razorpay Order (Backend calculates total from DB)
const createOrder = async (req, res) => {
  const { items, couponCode, prescription } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  try {
    let totalAmount = 0;

    for (const item of items) {
      const productRes = await db.query('SELECT id, name, price, stock FROM products WHERE id = ?', [item.productId]);
      if (productRes.rows.length === 0) {
        return res.status(404).json({ message: `Product ID ${item.productId} not found` });
      }

      const product = productRes.rows[0];
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      totalAmount += parseFloat(product.price) * item.quantity;
    }

    if (prescription) {
      if (prescription.lensIndex === '1.61') totalAmount += 800;
      else if (prescription.lensIndex === '1.67') totalAmount += 1600;
      else if (prescription.lensIndex === '1.74') totalAmount += 2800;

      if (prescription.antiGlare) totalAmount += 250;
      if (prescription.blueShield) totalAmount += 300;
      if (prescription.photochromic) totalAmount += 600;
    }

    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      if (code === 'LEKYA20')   totalAmount = totalAmount * 0.80;
      else if (code === 'WELCOME10') totalAmount = totalAmount * 0.90;
    }

    const receiptId = `receipt_order_${Date.now()}`;
    const amountInPaise = Math.round(totalAmount * 100);

    if (isDummyKey || !razorpay) {
      return res.json({
        id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        status: 'created',
        isMock: true,
        key_id: 'rzp_test_dummykey123'
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
    });

    res.json({
      ...razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID,
      isMock: false
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// 2. Verify Payment & Save Order to Database
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    shipping_address,
    isMockPayment,
    couponCode
  } = req.body;

  const userId = req.user.id;

  if (!razorpay_order_id || !razorpay_payment_id || (!isMockPayment && !razorpay_signature)) {
    return res.status(400).json({ message: 'Payment details are missing' });
  }

  try {
    // Verify signature for real payments
    if (!isMockPayment && !isDummyKey && razorpay) {
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generatedSignature = hmac.digest('hex');
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment signature verification failed' });
      }
    }

    let orderId;

    await db.transaction(async (tx) => {
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const productRes = await tx.query(
          'SELECT id, name, price, stock FROM products WHERE id = ?',
          [item.productId]
        );

        if (productRes.rows.length === 0) {
          throw new Error(`Product ID ${item.productId} not found`);
        }

        const product = productRes.rows[0];
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const price = parseFloat(product.price);
        totalAmount += price * item.quantity;
        validatedItems.push({ id: product.id, quantity: item.quantity, price });

        // Reduce stock
        await tx.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, product.id]);
      }

      if (shipping_address && shipping_address.prescription) {
        const rx = shipping_address.prescription;
        if (rx.lensIndex === '1.61') totalAmount += 800;
        else if (rx.lensIndex === '1.67') totalAmount += 1600;
        else if (rx.lensIndex === '1.74') totalAmount += 2800;

        if (rx.antiGlare) totalAmount += 250;
        if (rx.blueShield) totalAmount += 300;
        if (rx.photochromic) totalAmount += 600;
      }

      if (couponCode) {
        const code = couponCode.toUpperCase().trim();
        if (code === 'LEKYA20')   totalAmount = totalAmount * 0.80;
        else if (code === 'WELCOME10') totalAmount = totalAmount * 0.90;
      }

      // Insert Order
      await tx.query(
        `INSERT INTO orders (user_id, total_amount, status, payment_id, shipping_address)
         VALUES (?, ?, 'Paid', ?, ?)`,
        [userId, totalAmount, razorpay_payment_id, JSON.stringify(shipping_address)]
      );

      // Get newly created order ID
      const orderRes = await tx.query(
        'SELECT id FROM orders WHERE user_id = ? AND payment_id = ? ORDER BY id DESC LIMIT 1',
        [userId, razorpay_payment_id]
      );
      orderId = orderRes.rows[0].id;

      // Insert Order Items
      for (const item of validatedItems) {
        await tx.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [orderId, item.id, item.quantity, item.price]
        );
      }
    });

    console.log(`[EMAIL] Order confirmation sent to User ${userId} for Order ${orderId}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(err.message.includes('not found') || err.message.includes('stock') ? 400 : 500).json({
      message: err.message || 'Server error verifying payment and saving order'
    });
  }
};

// 3. Get Order History for a User
const getOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const ordersRes = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    // For each order fetch its items
    const ordersWithItems = await Promise.all(ordersRes.rows.map(async (order) => {
      const itemsRes = await db.query(
        `SELECT oi.id, oi.product_id, p.name, p.image_urls, oi.quantity, oi.price
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      const items = itemsRes.rows.map(item => {
        let img = item.image_urls;
        if (Array.isArray(img)) img = img[0];
        else if (typeof img === 'string') {
          try { img = JSON.parse(img)[0]; } catch (_) {}
        }
        return { ...item, image: img };
      });

      return { ...order, items };
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// 4. Create a Review for a Product
const addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!productId || !rating) {
    return res.status(400).json({ message: 'Product ID and rating are required' });
  }

  try {
    const reviewCheck = await db.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );

    if (reviewCheck.rows.length > 0) {
      await db.query(
        `UPDATE reviews SET rating = ?, comment = ?, created_at = datetime('now') WHERE product_id = ? AND user_id = ?`,
        [rating, comment, productId, userId]
      );
      return res.json({ message: 'Review updated successfully' });
    }

    await db.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [productId, userId, rating, comment]
    );

    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Server error adding review' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getOrders,
  addReview
};
