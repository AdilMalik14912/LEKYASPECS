/**
 * shippingController.js — Parcel Uncle & Logistics Management API
 */

const db = require('../config/db');
const parcelUncle = require('../utils/parcelUncle');
const { sendStatusUpdateEmail } = require('../utils/mailer');
const { sendStatusUpdateSms } = require('../utils/sms');

// Helper to map Parcel Uncle status codes to Lekya Specs Order Statuses
function mapParcelUncleToSpecsStatus(puStatus) {
  if (!puStatus) return null;
  const s = String(puStatus).toUpperCase();
  if (['DELIVERED'].includes(s)) return 'Delivered';
  if (['OUT_FOR_DELIVERY', 'DELIVERY_ATTEMPTED'].includes(s)) return 'Out for Delivery';
  if (['PICKED_UP', 'ARRIVED_AT_HUB', 'SORTING', 'IN_TRANSIT'].includes(s)) return 'Shipped';
  if (['ASSIGNED', 'ACCEPTED', 'WAITING_PICKUP', 'PICKUP_ATTEMPTED', 'READY_TO_SHIP'].includes(s)) return 'Packed';
  if (['PAID', 'PROCESSING', 'CREATED', 'PENDING'].includes(s)) return 'Processing';
  if (['CANCELLED', 'RTO_INITIATED', 'RTO_IN_TRANSIT', 'RETURNED', 'FAILED', 'LOST'].includes(s)) return 'Cancelled';
  return null;
}

// Synchronize a specific order with Parcel Uncle live status
const syncParcelUncleStatus = async (orderIdOrWaybill) => {
  try {
    const orderRes = await db.query(
      `SELECT o.*, u.email as customer_email, u.name as customer_name, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ? OR o.parcel_uncle_tracking_id = ?`,
      [orderIdOrWaybill, orderIdOrWaybill]
    );

    if (orderRes.rows.length === 0) return null;

    const order = orderRes.rows[0];
    const waybill = order.parcel_uncle_tracking_id;
    if (!waybill) return order;

    // Fetch live status from Parcel Uncle API
    const trackingRes = await parcelUncle.getTrackingStatus(waybill);
    const trackingData = trackingRes.data || trackingRes;
    const puStatus = trackingData.current_status || trackingData.status;

    if (!puStatus) return order;

    const newSpecsStatus = mapParcelUncleToSpecsStatus(puStatus);
    const comment = `Shipped via Parcel Uncle Express (Waybill: ${waybill}) — ${puStatus.replace(/_/g, ' ')}`;

    let statusUpdated = false;
    if (newSpecsStatus && newSpecsStatus !== order.status) {
      statusUpdated = true;
      await db.query(
        `UPDATE orders 
         SET status = ?,
             parcel_uncle_status = ?,
             tracking_comments = ?
         WHERE id = ?`,
        [newSpecsStatus, puStatus, comment, order.id]
      );

      // Trigger notifications if status changed to Shipped, Out for Delivery, or Delivered
      if (['Shipped', 'Out for Delivery', 'Delivered'].includes(newSpecsStatus)) {
        if (order.customer_email) {
          sendStatusUpdateEmail({
            to: order.customer_email,
            customerName: order.customer_name || 'Valued Customer',
            orderId: order.id,
            status: newSpecsStatus,
            note: `Courier: Parcel Uncle Express (${puStatus})`,
            totalAmount: order.total_amount
          }).catch(err => console.warn('[Parcel Uncle Sync Email]', err.message));
        }

        if (order.customer_phone) {
          sendStatusUpdateSms({
            to: order.customer_phone,
            customerName: order.customer_name || 'Valued Customer',
            orderId: order.id,
            status: newSpecsStatus,
            note: `Parcel Uncle Waybill: ${waybill}`
          }).catch(err => console.warn('[Parcel Uncle Sync SMS]', err.message));
        }
      }
    } else if (puStatus !== order.parcel_uncle_status) {
      await db.query(
        `UPDATE orders SET parcel_uncle_status = ? WHERE id = ?`,
        [puStatus, order.id]
      );
    }

    return { ...order, status: newSpecsStatus || order.status, parcel_uncle_status: puStatus, statusUpdated };
  } catch (err) {
    console.warn('[PARCEL UNCLE SYNC ERROR]', err.message);
    return null;
  }
};

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
       LEFT JOIN products p ON oi.product_id = p.id
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

    const waybill = parcelResult.waybill || parcelResult.tracking_number;
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
        parcelResult.status || 'CREATED',
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

// 2. Track Parcel Uncle Shipment & Auto-Sync
const trackParcelUncle = async (req, res) => {
  const { waybillOrOrderId } = req.params;

  try {
    let waybill = waybillOrOrderId;
    let orderId = null;

    if (!isNaN(waybillOrOrderId)) {
      orderId = Number(waybillOrOrderId);
      const orderRes = await db.query(
        `SELECT parcel_uncle_tracking_id, tracking_id, status FROM orders WHERE id = ?`,
        [orderId]
      );
      if (orderRes.rows.length > 0) {
        waybill = orderRes.rows[0].parcel_uncle_tracking_id || orderRes.rows[0].tracking_id;
      }
    }

    if (!waybill) {
      return res.status(404).json({ message: 'Waybill or tracking ID not found' });
    }

    // Trigger sync
    if (orderId) {
      await syncParcelUncleStatus(orderId);
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

// 3. HTTP Handler for 1-Click Status Sync
const syncParcelUncleHandler = async (req, res) => {
  const { orderId } = req.params;
  try {
    const updatedOrder = await syncParcelUncleStatus(orderId);
    if (!updatedOrder) {
      return res.status(404).json({ message: `Order #${orderId} not found` });
    }
    res.json({
      success: true,
      message: `Parcel Uncle status synced for Order #${orderId}`,
      order: updatedOrder
    });
  } catch (err) {
    console.error('Sync Parcel Uncle error:', err);
    res.status(500).json({ message: 'Server error syncing Parcel Uncle status' });
  }
};

// 4. Webhook Handler (POST /api/shipping/parcel-uncle/webhook)
const handleWebhook = async (req, res) => {
  const { waybill, tracking_number, status, current_status } = req.body || {};
  const targetWaybill = waybill || tracking_number;

  if (!targetWaybill) {
    return res.status(400).json({ message: 'Tracking waybill number missing in webhook payload' });
  }

  const updatedOrder = await syncParcelUncleStatus(targetWaybill);
  if (!updatedOrder) {
    return res.status(404).json({ message: `Order not found for waybill ${targetWaybill}` });
  }

  res.json({
    success: true,
    message: `Parcel Uncle status webhook processed for waybill ${targetWaybill}`,
    order: updatedOrder
  });
};

// 5. Cancel Parcel Uncle Shipment
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

// 6. Get Integration Configuration Status
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
      'Real-Time Webhook & Polling Status Synchronization',
      'Customer & Staff Real-Time Courier Tracking',
      'SMS & Email Status Alerts'
    ]
  });
};

// 7. Download Printable 4x6 Shipping Label PDF
const downloadLabel = async (req, res) => {
  const { waybillOrOrderId } = req.params;
  try {
    let waybill = waybillOrOrderId;
    if (!isNaN(waybillOrOrderId)) {
      const orderRes = await db.query('SELECT parcel_uncle_tracking_id FROM orders WHERE id = ?', [waybillOrOrderId]);
      if (orderRes.rows.length > 0 && orderRes.rows[0].parcel_uncle_tracking_id) {
        waybill = orderRes.rows[0].parcel_uncle_tracking_id;
      }
    }

    const labelResult = await parcelUncle.getShippingLabel(waybill);
    if (labelResult.success && labelResult.buffer) {
      res.setHeader('Content-Type', labelResult.contentType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Shipping-Label-${waybill}.pdf"`);
      return res.send(labelResult.buffer);
    } else {
      res.status(404).json({ message: labelResult.message || 'Shipping label PDF unavailable from carrier API' });
    }
  } catch (err) {
    console.error('Download shipping label error:', err);
    res.status(500).json({ message: 'Server error generating shipping label PDF' });
  }
};

// 8. Register Merchant Webhook URL with Parcel Uncle Network
const registerWebhookHandler = async (req, res) => {
  try {
    const { webhookUrl } = req.body || {};
    const urlToRegister = webhookUrl || 'https://lekyaspecs.vercel.app/api/shipping/parcel-uncle/webhook';
    const result = await parcelUncle.registerWebhook(urlToRegister);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Register webhook error:', err);
    res.status(500).json({ message: 'Server error registering webhook URL' });
  }
};

// 9. List Non-Delivery Reports (NDR)
const getNdrListHandler = async (req, res) => {
  try {
    const { status } = req.query;
    const result = await parcelUncle.getNdrList(status || 'OPEN');
    res.json(result);
  } catch (err) {
    console.error('Get NDR list error:', err);
    res.status(500).json({ message: 'Server error fetching NDR list' });
  }
};

// 10. Take Action on NDR Case
const takeNdrActionHandler = async (req, res) => {
  const { trackingNumber } = req.params;
  try {
    const result = await parcelUncle.takeNdrAction(trackingNumber, req.body);
    res.json(result);
  } catch (err) {
    console.error('Take NDR action error:', err);
    res.status(500).json({ message: 'Server error taking NDR action' });
  }
};

// 11. Serviceability Check
const checkServiceabilityHandler = async (req, res) => {
  const { pincode } = req.query;
  try {
    const result = await parcelUncle.checkServiceability(pincode || '110014');
    res.json(result);
  } catch (err) {
    console.error('Check serviceability error:', err);
    res.status(500).json({ message: 'Server error checking pincode serviceability' });
  }
};

// 12. Rate Quote Calculator
const getRateQuoteHandler = async (req, res) => {
  try {
    const result = await parcelUncle.getRateQuote(req.body);
    res.json(result);
  } catch (err) {
    console.error('Get rate quote error:', err);
    res.status(500).json({ message: 'Server error fetching rate quote' });
  }
};

module.exports = {
  dispatchParcelUncle,
  trackParcelUncle,
  syncParcelUncleStatus,
  syncParcelUncleHandler,
  handleWebhook,
  cancelParcelUncle,
  downloadLabel,
  registerWebhookHandler,
  getNdrListHandler,
  takeNdrActionHandler,
  checkServiceabilityHandler,
  getRateQuoteHandler,
  getConfig
};
