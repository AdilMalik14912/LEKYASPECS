const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');
const { sendStatusUpdateEmail } = require('../utils/mailer');
const { sendStatusUpdateSms } = require('../utils/sms');
require('dotenv').config();

// Initialize Production Razorpay Client (Live Gateway)
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
      const pId = item.productId || item.product_id || item.id || item.product?.id;
      const productRes = await db.query('SELECT id, name, price, stock FROM products WHERE id = ?', [pId]);
      if (productRes.rows.length === 0) {
        return res.status(404).json({ message: `Product ID ${pId} not found` });
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
      const couponRes = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [code]);
      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        let isValid = true;
        if (coupon.expiry_date) {
          const expiry = new Date(coupon.expiry_date);
          if (expiry < new Date()) isValid = false;
        }
        if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
          isValid = false;
        }

        if (isValid) {
          if (coupon.discount_type === 'percentage') {
            totalAmount = totalAmount * (1 - coupon.discount_value / 100);
          } else if (coupon.discount_type === 'flat') {
            totalAmount = Math.max(0, totalAmount - coupon.discount_value);
          }
        }
      } else {
        if (code === 'LEKYA20')   totalAmount = totalAmount * 0.80;
        else if (code === 'WELCOME10') totalAmount = totalAmount * 0.90;
      }
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
    let finalTotalAmount = 0;

    await db.transaction(async (tx) => {
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const pId = item.productId || item.product_id || item.id || item.product?.id;
        const productRes = await tx.query(
          'SELECT id, name, price, stock FROM products WHERE id = ?',
          [pId]
        );

        if (productRes.rows.length === 0) {
          throw new Error(`Product ID ${pId} not found`);
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
        const couponRes = await tx.query('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [code]);
        if (couponRes.rows.length > 0) {
          const coupon = couponRes.rows[0];
          let isValid = true;
          if (coupon.expiry_date) {
            const expiry = new Date(coupon.expiry_date);
            if (expiry < new Date()) isValid = false;
          }
          if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
            isValid = false;
          }

          if (isValid) {
            if (coupon.discount_type === 'percentage') {
              totalAmount = totalAmount * (1 - coupon.discount_value / 100);
            } else if (coupon.discount_type === 'flat') {
              totalAmount = Math.max(0, totalAmount - coupon.discount_value);
            }
            await tx.query('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', [coupon.id]);
          }
        } else {
          if (code === 'LEKYA20')   totalAmount = totalAmount * 0.80;
          else if (code === 'WELCOME10') totalAmount = totalAmount * 0.90;
        }
      }

      // Prescription Add-ons Calculation
      const lensType = shipping_address?.prescription?.lensIndex ? `Index ${shipping_address.prescription.lensIndex}` : null;
      let lensPrice = 0.0;
      if (shipping_address && shipping_address.prescription) {
        const rx = shipping_address.prescription;
        if (rx.lensIndex === '1.61') lensPrice += 800;
        else if (rx.lensIndex === '1.67') lensPrice += 1600;
        else if (rx.lensIndex === '1.74') lensPrice += 2800;

        if (rx.antiGlare) lensPrice += 250;
        if (rx.blueShield) lensPrice += 300;
        if (rx.photochromic) lensPrice += 600;
      }
      const prescriptionDetails = shipping_address?.prescription ? JSON.stringify(shipping_address.prescription) : null;

      // Generate a unique 10-digit tracking ID starting with LS
      const trackingId = 'LS' + Math.floor(1000000000 + Math.random() * 9000000000).toString();

      // Insert Order with new columns
      await tx.query(
        `INSERT INTO orders (user_id, total_amount, status, payment_id, shipping_address, lens_type, lens_price, prescription_details, tracking_id)
         VALUES (?, ?, 'Paid', ?, ?, ?, ?, ?, ?)`,
        [userId, totalAmount, razorpay_payment_id, JSON.stringify(shipping_address), lensType, lensPrice, prescriptionDetails, trackingId]
      );

      // Get newly created order ID
      const orderRes = await tx.query(
        'SELECT id FROM orders WHERE user_id = ? AND payment_id = ? ORDER BY id DESC LIMIT 1',
        [userId, razorpay_payment_id]
      );
      if (!orderRes.rows || orderRes.rows.length === 0) {
        throw new Error('Order was created but could not retrieve order ID');
      }
      orderId = orderRes.rows[0].id;
      if (!orderId) throw new Error('Order ID is null after creation');
      finalTotalAmount = totalAmount;

      // Insert Order Items
      for (const item of validatedItems) {
        await tx.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [orderId, item.id, item.quantity, item.price]
        );
      }

      // Award Loyalty points to user (5% of order amount)
      const earnedPoints = Math.round(totalAmount * 0.05);
      await tx.query('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?', [earnedPoints, userId]);
    });

    // ── Notify customer: Payment Confirmed (email + SMS) ────────────────────
    const userRes = await db.query(
      `SELECT u.name, u.email, u.phone, oi.quantity, p.name as pname, oi.price
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = ? LIMIT 10`,
      [orderId]
    );
    if (userRes.rows.length > 0) {
      const row = userRes.rows[0];
      // Send 'Payment Confirmed' status email
      sendStatusUpdateEmail({
        to:           row.email,
        customerName: row.name,
        orderId,
        status:       'Payment Confirmed',
        totalAmount:  finalTotalAmount
      }).catch(err => console.warn('[Payment Confirmed Email]', err.message));
      // Send status SMS
      if (row.phone) {
        sendStatusUpdateSms({
          to:           row.phone,
          customerName: row.name,
          orderId,
          status:       'Payment Confirmed'
        }).catch(err => console.warn('[Payment Confirmed SMS]', err.message));
      }
    }

    console.log(`[ORDER] Confirmation notifications sent for Order ${orderId}`);

    // ── Smart Auto-Dispatch: Delhi NCR -> Parcel Uncle | Rest of India -> Courier Uncle ──────
    try {
      const { createShipment } = require('../utils/parcelUncle');
      const { createPanIndiaShipment } = require('../utils/courierUncle');
      const userRow = userRes.rows[0];

      // Fetch full order items with product names & SKUs
      const orderItemsRes = await db.query(
        `SELECT oi.quantity, oi.price, p.name, p.id as product_id
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      const richItems = orderItemsRes.rows.length > 0 ? orderItemsRes.rows : items;

      let parsedAddr = shipping_address;
      if (typeof shipping_address === 'string') {
        try { parsedAddr = JSON.parse(shipping_address); } catch (_) { parsedAddr = {}; }
      }

      const pincodeStr = String(parsedAddr?.pincode || parsedAddr?.zip || '').trim().replace(/\D/g, '');
      const DELHI_NCR_PINCODE_PREFIXES = ['110', '121', '122', '201', '140'];
      const isDelhiNcr = DELHI_NCR_PINCODE_PREFIXES.some(prefix => pincodeStr.startsWith(prefix));

      let shipmentResult;
      let courierPartnerName = '';

      if (isDelhiNcr) {
        console.log(`[SMART AUTO-ROUTER] Order #${orderId} Pincode '${pincodeStr}' is DELHI NCR. Auto-Routing to Parcel Uncle API...`);
        courierPartnerName = 'Parcel Uncle Express (Delhi NCR Local)';
        shipmentResult = await createShipment({
          orderId,
          customerName: userRow?.name || shipping_address?.name,
          customerPhone: userRow?.phone || shipping_address?.phone,
          customerEmail: userRow?.email,
          shippingAddress: shipping_address,
          items: richItems,
          totalAmount: finalTotalAmount,
          isUrgent: req.body.is_urgent || false
        });
      } else {
        console.log(`[SMART AUTO-ROUTER] Order #${orderId} Pincode '${pincodeStr}' is PAN-INDIA (Outside NCR). Auto-Routing to Courier Uncle API...`);
        courierPartnerName = 'Courier Uncle Pan-India Express (Delhivery/Bluedart)';
        shipmentResult = await createPanIndiaShipment({
          orderId,
          customerName: userRow?.name || shipping_address?.name,
          customerPhone: userRow?.phone || shipping_address?.phone,
          customerEmail: userRow?.email,
          shippingAddress: shipping_address,
          items: richItems,
          totalAmount: finalTotalAmount,
          isCod: false
        });
      }

      if (shipmentResult && (shipmentResult.waybill || shipmentResult.tracking_number)) {
        const waybill = shipmentResult.waybill || shipmentResult.tracking_number;
        const subCourier = shipmentResult.courier || (isDelhiNcr ? 'Parcel Uncle Express' : 'Delhivery');
        const formattedPartner = subCourier.includes('Parcel Uncle') || subCourier.includes('Courier Uncle')
          ? subCourier
          : `Courier Uncle (${subCourier})`;

        await db.query(
          `UPDATE orders 
           SET parcel_uncle_tracking_id = ?,
               parcel_uncle_status = ?,
               parcel_uncle_response = ?,
               courier_partner = ?
           WHERE id = ?`,
          [
            waybill,
            shipmentResult.status || 'CREATED',
            JSON.stringify(shipmentResult.rawResponse || shipmentResult),
            formattedPartner,
            orderId
          ]
        );
        console.log(`[AUTO-SHIPMENT SUCCESS] Order #${orderId} automatically routed via ${formattedPartner}. AWB: ${waybill}`);
      }
    } catch (shippingErr) {
      console.warn('[AUTO-SHIPMENT WARNING]', shippingErr.message);
    }

    // Auto-update customer metrics in CRM
    try {
      const { upsertCrmLeadFromUser } = require('./crmController');
      upsertCrmLeadFromUser(userId);
    } catch (_) {}

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

    const { syncParcelUncleStatus } = require('./shippingController');

    // For each order fetch its items & auto-sync Parcel Uncle status if active
    const ordersWithItems = await Promise.all(ordersRes.rows.map(async (rawOrder) => {
      let order = rawOrder;

      // Auto-sync Parcel Uncle courier status for active shipments
      if (order.parcel_uncle_tracking_id && order.status !== 'Delivered' && order.status !== 'Cancelled') {
        try {
          const synced = await syncParcelUncleStatus(order.id);
          if (synced) order = { ...order, ...synced };
        } catch (_) {}
      }

      const itemsRes = await db.query(
        `SELECT oi.id, oi.product_id, COALESCE(p.name, 'Eyewear Frame') as name, p.image_urls, oi.quantity, oi.price
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      const items = itemsRes.rows.map(item => {
        let img = item.image_urls;
        if (Array.isArray(img)) img = img[0];
        else if (typeof img === 'string') {
          try { img = JSON.parse(img)[0]; } catch (_) {}
        }
        return { ...item, image: img || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=400&q=80' };
      });

      return { ...order, items };
    }));

    res.json(ordersWithItems || []);
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

// 5. Validate Coupon Code (Checkout API)
const validateCouponCode = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  try {
    const couponRes = await db.query('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [code.toUpperCase().trim()]);
    if (couponRes.rows.length === 0) {
      const upperCode = code.toUpperCase().trim();
      if (upperCode === 'LEKYA20') {
        return res.json({ valid: true, discount_type: 'percentage', discount_value: 20 });
      } else if (upperCode === 'WELCOME10') {
        return res.json({ valid: true, discount_type: 'percentage', discount_value: 10 });
      }
      return res.status(400).json({ valid: false, message: 'Invalid or inactive promo code' });
    }

    const coupon = couponRes.rows[0];
    if (coupon.expiry_date) {
      const expiry = new Date(coupon.expiry_date);
      if (expiry < new Date()) {
        return res.status(400).json({ valid: false, message: 'Promo code has expired' });
      }
    }

    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return res.status(400).json({ valid: false, message: 'Promo code usage limit reached' });
    }

    res.json({
      valid: true,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ message: 'Server error validating promo code' });
  }
};

// 6. Track order publicly by tracking ID
const trackOrderByTrackingId = async (req, res) => {
  const { trackingId } = req.params;
  if (!trackingId) {
    return res.status(400).json({ message: 'Tracking ID is required' });
  }

  try {
    const result = await db.query(
      `SELECT o.id, o.status, o.created_at, o.tracking_comments, o.shipping_address, o.lens_type,
              u.name as customer_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.tracking_id = ?`,
      [trackingId.toUpperCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found with the provided tracking ID' });
    }

    const order = result.rows[0];

    // Fetch order items details
    const itemsRes = await db.query(
      `SELECT oi.quantity, p.name, p.image_urls
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
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

    // Mask sensitive customer info for public view
    let maskedName = 'Valued Customer';
    if (order.customer_name) {
      const parts = order.customer_name.split(' ');
      maskedName = parts.map(p => p.charAt(0) + '*'.repeat(Math.max(1, p.length - 1))).join(' ');
    }

    let shippingCity = '—';
    if (order.shipping_address) {
      try {
        const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
        shippingCity = addr.city || addr.City || '—';
      } catch (_) {}
    }

    res.json({
      tracking_id: trackingId,
      status: order.status,
      created_at: order.created_at,
      tracking_comments: order.tracking_comments,
      lens_type: order.lens_type,
      customer_name: maskedName,
      city: shippingCity,
      parcel_uncle_tracking_id: order.parcel_uncle_tracking_id,
      parcel_uncle_status: order.parcel_uncle_status,
      courier_partner: order.courier_partner || 'Parcel Uncle Express',
      items
    });
  } catch (err) {
    console.error('Track order error:', err);
    res.status(500).json({ message: 'Server error tracking order' });
  }
};

// 7. Helper to initiate automatic Razorpay Refund
const processRazorpayRefund = async (paymentId, amountInRupees) => {
  if (!paymentId || paymentId.startsWith('pay_mock_') || isDummyKey || !razorpay) {
    console.log(`[REFUND] Mock/Sandbox refund for payment ${paymentId} of amount ₹${amountInRupees}`);
    return { success: true, isMock: true };
  }

  try {
    const amountInPaise = Math.round(amountInRupees * 100);
    const refund = await razorpay.payments.refund(paymentId, { amount: amountInPaise });
    console.log(`[REFUND] Razorpay refund successful for ${paymentId}:`, refund.id);
    return { success: true, refundId: refund.id };
  } catch (err) {
    console.error(`[REFUND] Razorpay refund error for ${paymentId}:`, err.message);
    return { success: false, error: err.message };
  }
};

// 8. Razorpay Asynchronous Webhook Handler
const handleRazorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'specs_webhook_secret_default';
  const signature = req.headers['x-razorpay-signature'];

  try {
    if (signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(JSON.stringify(req.body));
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) {
        console.warn('[WEBHOOK] Invalid Razorpay webhook signature');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    console.log(`[WEBHOOK] Received Razorpay event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const paymentId = paymentEntity?.id;
      const orderIdRef = paymentEntity?.order_id;

      if (paymentId) {
        const orderRes = await db.query('SELECT * FROM orders WHERE payment_id = ? OR payment_id = ?', [paymentId, orderIdRef]);
        if (orderRes.rows.length > 0) {
          const order = orderRes.rows[0];
          if (order.status !== 'Paid' && order.status !== 'Delivered') {
            await db.query("UPDATE orders SET status = 'Paid' WHERE id = ?", [order.id]);
            console.log(`[WEBHOOK] Order #${order.id} status updated to Paid via Webhook`);

            const userRes = await db.query('SELECT name, email, phone FROM users WHERE id = ?', [order.user_id]);
            if (userRes.rows.length > 0) {
              const u = userRes.rows[0];
              sendStatusUpdateEmail({
                to: u.email,
                customerName: u.name,
                orderId: order.id,
                status: 'Payment Confirmed',
                totalAmount: order.total_amount
              }).catch(e => console.warn('[Webhook Email]', e.message));

              if (u.phone) {
                sendStatusUpdateSms({
                  to: u.phone,
                  customerName: u.name,
                  orderId: order.id,
                  status: 'Payment Confirmed'
                }).catch(e => console.warn('[Webhook SMS]', e.message));
              }
            }
          }
        }
      }
    } else if (event === 'refund.processed') {
      const refundEntity = payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        await db.query("UPDATE orders SET status = 'Refunded' WHERE payment_id = ?", [paymentId]);
        console.log(`[WEBHOOK] Order for payment ${paymentId} marked as Refunded via Webhook`);
      }
    }

    res.json({ status: 'ok', received: true });
  } catch (err) {
    console.error('[WEBHOOK] Error processing webhook:', err);
    res.status(500).json({ message: 'Webhook processing error' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getOrders,
  addReview,
  validateCouponCode,
  trackOrderByTrackingId,
  processRazorpayRefund,
  handleRazorpayWebhook
};
