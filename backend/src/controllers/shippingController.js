/**
 * shippingController.js — Parcel Uncle & Logistics Management API
 */

const db = require('../config/db');
const parcelUncle = require('../utils/parcelUncle');
const { sendStatusUpdateEmail } = require('../utils/mailer');
const { sendStatusUpdateSms } = require('../utils/sms');

// 1. Manually Dispatch / Push Order to Parcel Uncle
const dispatchParcelUncle = async (req, res) => {
  const { orderId } = req.params;
  const { isUrgent } = req.body;

  try {
    const orderRes = await db.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: `Order #${orderId} not found` });
    }

    const order = orderRes.rows[0];

    // Fetch order items
    const itemsRes = await db.query(
      `SELECT oi.id, oi.quantity, oi.price, p.name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const parcelResult = await parcelUncle.createShipment({
      orderId: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      shippingAddress: order.shipping_address,
      items: itemsRes.rows,
      totalAmount: order.total_amount,
      isUrgent: isUrgent !== undefined ? isUrgent : !!order.is_urgent
    });

    const waybill = parcelResult.waybill;
    const comments = `Shipped via Parcel Uncle Express (Waybill: ${waybill})`;

    await db.query(
      `UPDATE orders 
       SET status = 'Shipped',
           parcel_uncle_tracking_id = ?,
           parcel_uncle_status = ?,
           parcel_uncle_response = ?,
           courier_partner = 'Parcel Uncle Express',
           tracking_comments = ?
       WHERE id = ?`,
      [
        waybill,
        parcelResult.status,
        JSON.stringify(parcelResult.rawResponse || parcelResult),
        comments,
        orderId
      ]
    );

    // Send customer notification email + SMS
    if (order.customer_email) {
      sendStatusUpdateEmail({
        to: order.customer_email,
        customerName: order.customer_name || 'Valued Customer',
        orderId: order.id,
        status: 'Shipped',
        note: `Courier: Parcel Uncle Express | Waybill: ${waybill}`,
        totalAmount: order.total_amount
      }).catch(err => console.warn('[Parcel Uncle Dispatch Email]', err.message));
    }

    if (order.customer_phone) {
      sendStatusUpdateSms({
        to: order.customer_phone,
        customerName: order.customer_name || 'Valued Customer',
        orderId: order.id,
        status: 'Shipped',
        note: `Parcel Uncle Waybill: ${waybill}`
      }).catch(err => console.warn('[Parcel Uncle Dispatch SMS]', err.message));
    }

    res.json({
      success: true,
      message: `Order #${orderId} successfully dispatched via Parcel Uncle Logistics Network`,
      waybill,
      courier: 'Parcel Uncle Express',
      shipment: parcelResult
    });
  } catch (err) {
    console.error('Dispatch Parcel Uncle error:', err);
    res.status(500).json({ message: 'Server error dispatching shipment via Parcel Uncle' });
  }
};

// 2. Track Parcel Uncle Shipment
const trackParcelUncle = async (req, res) => {
  const { waybillOrOrderId } = req.params;

  try {
    let waybill = waybillOrOrderId;

    // If param is numeric order ID, look up tracking ID from DB
    if (!isNaN(waybillOrOrderId)) {
      const orderRes = await db.query(
        `SELECT parcel_uncle_tracking_id, tracking_id, status FROM orders WHERE id = ?`,
        [waybillOrOrderId]
      );
      if (orderRes.rows.length > 0) {
        waybill = orderRes.rows[0].parcel_uncle_tracking_id || orderRes.rows[0].tracking_id;
      }
    }

    if (!waybill) {
      return res.status(404).json({ message: 'Waybill or tracking ID not found' });
    }

    const trackingData = await parcelUncle.getTrackingStatus(waybill);
    res.json({
      success: true,
      waybill,
      tracking: trackingData
    });
  } catch (err) {
    console.error('Track Parcel Uncle error:', err);
    res.status(500).json({ message: 'Server error tracking Parcel Uncle shipment' });
  }
};

// 3. Cancel Parcel Uncle Shipment
const cancelParcelUncle = async (req, res) => {
  const { orderId } = req.params;

  try {
    const orderRes = await db.query(
      `SELECT parcel_uncle_tracking_id FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: `Order #${orderId} not found` });
    }

    const waybill = orderRes.rows[0].parcel_uncle_tracking_id;
    let cancelResult = { success: true };

    if (waybill) {
      cancelResult = await parcelUncle.cancelShipment(waybill);
    }

    await db.query(
      `UPDATE orders SET parcel_uncle_status = 'CANCELLED' WHERE id = ?`,
      [orderId]
    );

    res.json({
      success: true,
      message: `Parcel Uncle shipment for Order #${orderId} cancelled`,
      cancelResult
    });
  } catch (err) {
    console.error('Cancel Parcel Uncle error:', err);
    res.status(500).json({ message: 'Server error cancelling Parcel Uncle shipment' });
  }
};

// 4. Get Integration Configuration Status
const getConfig = async (req, res) => {
  const apiKey = parcelUncle.API_KEY;
  const maskedKey = apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-6)}` : 'NOT_CONFIGURED';

  res.json({
    provider: 'Parcel Uncle Logistics & Courier Services',
    apiKeyMasked: maskedKey,
    baseUrl: parcelUncle.BASE_URL,
    mode: apiKey.startsWith('pu_test_') ? 'SANDBOX_TEST_ENVIRONMENT' : 'LIVE_PRODUCTION',
    status: 'ACTIVE_CONNECTED',
    features: [
      'Auto-Dispatch on Payment Verification',
      '1-Click Admin & Seller Dispatch',
      'Real-Time Parcel Uncle Waybill Tracking',
      'Express & Standard Priority Courier',
      'SMS & Email Waybill Alerts'
    ]
  });
};

module.exports = {
  dispatchParcelUncle,
  trackParcelUncle,
  cancelParcelUncle,
  getConfig
};
