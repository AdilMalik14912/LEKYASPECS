/**
 * shippingController.js — Parcel Uncle & Logistics Management API
 */

const db = require('../config/db');
const parcelUncle = require('../utils/parcelUncle');
const courierUncle = require('../utils/courierUncle');
const { sendStatusUpdateEmail } = require('../utils/mailer');
const { sendStatusUpdateSms } = require('../utils/sms');

// Delhi NCR Pincode Prefixes for Local Hyperlocal Delivery
const DELHI_NCR_PINCODE_PREFIXES = ['110', '121', '122', '201', '140'];

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

// 7. Download Printable 4x6 Shipping Label (PDF / Print HTML with SKU Table & Barcode)
const downloadLabel = async (req, res) => {
  const { waybillOrOrderId } = req.params;
  try {
    let waybill = waybillOrOrderId;
    let orderId = null;

    if (!isNaN(waybillOrOrderId)) {
      orderId = Number(waybillOrOrderId);
      const orderRes = await db.query('SELECT id, parcel_uncle_tracking_id FROM orders WHERE id = ?', [orderId]);
      if (orderRes.rows.length > 0) {
        waybill = orderRes.rows[0].parcel_uncle_tracking_id || `PUAWB${orderId}`;
      }
    } else {
      const orderRes = await db.query('SELECT id FROM orders WHERE parcel_uncle_tracking_id = ?', [waybillOrOrderId]);
      if (orderRes.rows.length > 0) {
        orderId = orderRes.rows[0].id;
      }
    }

    // Try carrier API first
    const labelResult = await parcelUncle.getShippingLabel(waybill);
    if (labelResult.success && labelResult.buffer && labelResult.buffer.length > 100) {
      res.setHeader('Content-Type', labelResult.contentType || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Shipping-Label-${waybill}.pdf"`);
      return res.send(labelResult.buffer);
    }

    // Fallback: Generate 4x6 inch Thermal Printable Shipping Label with SKU Breakdown & Barcode
    let orderData = null;
    let orderItems = [];

    if (orderId) {
      const dbOrder = await db.query(
        `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId]
      );
      if (dbOrder.rows.length > 0) orderData = dbOrder.rows[0];

      const dbItems = await db.query(
        `SELECT oi.*, p.name as product_name, p.category
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      orderItems = dbItems.rows;
    }

    let parsedAddr = {};
    if (orderData && orderData.shipping_address) {
      try { parsedAddr = typeof orderData.shipping_address === 'string' ? JSON.parse(orderData.shipping_address) : orderData.shipping_address; } catch (_) { }
    }

    const recipientName = orderData?.customer_name || parsedAddr?.name || 'Valued Customer';
    const recipientPhone = orderData?.customer_phone || parsedAddr?.phone || '9876543210';
    const deliveryAddress = parsedAddr?.address || parsedAddr?.street || 'Delivery Address';
    const deliveryCity = parsedAddr?.city || 'Delhi NCR';
    const deliveryState = parsedAddr?.state || 'Delhi';
    const deliveryPincode = parsedAddr?.pincode || parsedAddr?.zip || '110014';
    const totalAmount = orderData?.total_amount || 800;
    const isCod = orderData?.status === 'COD';

    const itemsHtml = orderItems.map((it, idx) => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">SKU-LEKYA-${it.product_id || (idx + 1)}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; font-size: 11px;">${it.product_name || 'Lekya Eyewear Frame'}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: center; font-weight: bold; font-size: 11px;">${it.quantity || 1}</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: right; font-size: 11px;">₹${parseFloat(it.price || 0).toLocaleString('en-IN')}</td>
      </tr>
    `).join('') || `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 11px;">SKU-LEKYA-101</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; font-size: 11px;">Lekya Premium Eyewear Frame</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: center; font-weight: bold; font-size: 11px;">1</td>
        <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: right; font-size: 11px;">₹${parseFloat(totalAmount).toLocaleString('en-IN')}</td>
      </tr>
    `;

    const labelHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shipping Label - ${waybill}</title>
  <style>
    @page { size: 4in 6in; margin: 0; }
    body { margin: 0; padding: 12px; font-family: Arial, sans-serif; background: #fff; color: #000; width: 3.75in; box-sizing: border-box; }
    .label-box { border: 2px solid #000; padding: 10px; border-radius: 4px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
    .logo { font-size: 16px; font-weight: 900; letter-spacing: 1px; }
    .badge { background: #000; color: #fff; padding: 3px 8px; font-size: 11px; font-weight: bold; border-radius: 3px; }
    .tracking-section { text-align: center; margin: 10px 0; border-bottom: 1px dashed #000; padding-bottom: 8px; }
    .awb-text { font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 2px; }
    .barcode { font-family: 'Libre Barcode 128', monospace; font-size: 40px; margin: 4px 0; }
    .addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 8px; font-size: 10px; }
    .addr-title { font-weight: bold; text-transform: uppercase; font-size: 9px; color: #444; border-bottom: 1px solid #ccc; padding-bottom: 2px; margin-bottom: 4px; }
    .items-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; }
    .items-table th { background: #f0f0f0; text-align: left; padding: 4px; border-bottom: 1px solid #000; font-size: 9px; }
    .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; pt: 6px; border-top: 2px solid #000; font-size: 11px; font-weight: bold; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap" rel="stylesheet">
</head>
<body onload="window.print()">
  <div class="label-box">
    <div class="header">
      <div>
        <div class="logo">PARCEL UNCLE</div>
        <div style="font-size: 8px; font-weight: bold; text-transform: uppercase;">Express Courier Network</div>
      </div>
      <div class="badge">${isCod ? 'COD: ₹' + totalAmount : 'PREPAID'}</div>
    </div>

    <div class="tracking-section">
      <div style="font-size: 9px; text-transform: uppercase; color: #555;">Tracking AWB Number</div>
      <div class="awb-text">${waybill}</div>
      <div class="barcode">*${waybill}*</div>
      <div style="font-size: 9px; font-family: monospace;">Ref: ORD-LEKYA-${orderId || '7'}</div>
    </div>

    <div class="addr-grid">
      <div>
        <div class="addr-title">SHIP FROM (SENDER):</div>
        <strong>Lekya Specs Hub</strong><br>
        102-J, Hari Nagar Ashram<br>
        South Delhi, Delhi - 110014<br>
        Ph: +91 9654119262
      </div>
      <div>
        <div class="addr-title">SHIP TO (RECIPIENT):</div>
        <strong>${recipientName}</strong><br>
        ${deliveryAddress}<br>
        ${deliveryCity}, ${deliveryState} - ${deliveryPincode}<br>
        Ph: +91 ${recipientPhone}
      </div>
    </div>

    <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; margin-top: 6px;">Product SKU Breakdown</div>
    <table class="items-table">
      <thead>
        <tr>
          <th>SKU Code</th>
          <th>Product Name</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="footer">
      <span>Total Amount: ₹${parseFloat(totalAmount).toLocaleString('en-IN')}</span>
      <span style="font-size: 9px;">Weight: 0.5 kg | Package</span>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(labelHtml);
  } catch (err) {
    console.error('Download shipping label error:', err);
    res.status(500).json({ message: 'Server error generating shipping label' });
  }
};

// 8b. Cancel Parcel Uncle Shipment (Delhi NCR)
const cancelParcelUncle = async (req, res) => {
  const { waybill } = req.params;
  const { reason } = req.body || {};
  if (!waybill) return res.status(400).json({ message: 'Waybill/AWB is required' });

  try {
    // 1. Call Parcel Uncle cancel API
    const cancelResult = await parcelUncle.cancelShipment(waybill, reason || 'Cancelled by admin');

    // 2. Update order status in DB
    await db.query(
      `UPDATE orders
       SET status = 'Cancelled',
           parcel_uncle_status = 'CANCELLED',
           tracking_comments = ?
       WHERE parcel_uncle_tracking_id = ?`,
      [`Shipment cancelled via Parcel Uncle API. Reason: ${reason || 'Admin cancellation'}`, waybill]
    );

    res.json({ success: true, message: `Shipment ${waybill} cancelled on Parcel Uncle`, result: cancelResult });
  } catch (err) {
    console.error('Cancel Parcel Uncle error:', err);
    res.status(500).json({ message: 'Server error cancelling Parcel Uncle shipment' });
  }
};

// 8c. Cancel Courier Uncle Shipment (Pan-India)
const cancelCourierUncle = async (req, res) => {
  const { waybill } = req.params;
  const { reason } = req.body || {};
  if (!waybill) return res.status(400).json({ message: 'Waybill/AWB is required' });

  try {
    // 1. Call Courier Uncle cancel API
    const cancelResult = await courierUncle.cancelShipment(waybill, reason || 'Cancelled by admin');

    // 2. Update order status in DB (search by order ID or tracking ID)
    const updateResult = await db.query(
      `UPDATE orders
       SET status = 'Cancelled',
           parcel_uncle_status = 'CANCELLED',
           tracking_comments = ?
       WHERE id = ? OR parcel_uncle_tracking_id = ?`,
      [`Shipment cancelled via Courier Uncle API. Reason: ${reason || 'Admin cancellation'}`, waybill, waybill]
    );

    res.json({
      success: true,
      message: `Shipment ${waybill} cancelled on Courier Uncle Pan-India Network`,
      rowsUpdated: updateResult.rowsAffected || updateResult.affectedRows || 0,
      result: cancelResult
    });
  } catch (err) {
    console.error('Cancel Courier Uncle error:', err);
    res.status(500).json({ message: 'Server error cancelling Courier Uncle shipment' });
  }
};

// 8d. Admin: Cancel any order by Order ID (cancels on carrier + updates DB)
const cancelOrderAdmin = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body || {};
  if (!orderId) return res.status(400).json({ message: 'Order ID is required' });

  try {
    // Fetch order
    const orderRes = await db.query(
      `SELECT * FROM orders WHERE id = ?`,
      [orderId]
    );
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: `Order ${orderId} not found in database` });
    }
    const order = orderRes.rows[0];
    const waybill = order.parcel_uncle_tracking_id;
    const carrier = order.courier_partner || '';
    const cancelReason = reason || 'Cancelled by admin';

    let carrierResult = { success: true, message: 'No carrier AWB found — only DB updated' };

    // Try to cancel on carrier API if AWB exists
    if (waybill) {
      try {
        if (carrier.toLowerCase().includes('courier uncle') || carrier.toLowerCase().includes('delhivery') ||
            carrier.toLowerCase().includes('bluedart') || carrier.toLowerCase().includes('xpressbees')) {
          carrierResult = await courierUncle.cancelShipment(waybill, cancelReason);
        } else {
          carrierResult = await parcelUncle.cancelShipment(waybill, cancelReason);
        }
      } catch (carrierErr) {
        console.warn(`[CANCEL] Carrier API error for ${waybill}:`, carrierErr.message);
        carrierResult = { success: false, message: carrierErr.message };
      }
    }

    // Always update DB regardless of carrier API result
    await db.query(
      `UPDATE orders
       SET status = 'Cancelled',
           parcel_uncle_status = 'CANCELLED',
           tracking_comments = ?
       WHERE id = ?`,
      [`Admin cancelled. Reason: ${cancelReason}${waybill ? `. Carrier AWB: ${waybill}` : ''}`, orderId]
    );

    console.log(`[ADMIN CANCEL] Order ${orderId} cancelled. Waybill: ${waybill || 'N/A'}. Carrier: ${carrier || 'N/A'}`);

    res.json({
      success: true,
      message: `Order ${orderId} cancelled successfully`,
      orderId,
      waybill: waybill || null,
      carrier: carrier || null,
      carrierCancelResult: carrierResult
    });
  } catch (err) {
    console.error('Cancel order admin error:', err);
    res.status(500).json({ message: `Server error cancelling order ${orderId}` });
  }
};

// 9. Register Merchant Webhook URL with Parcel Uncle Network
const registerWebhookHandler = async (req, res) => {
  try {
    const { webhookUrl } = req.body || {};
    const urlToRegister = webhookUrl || 'https://lekya.in/api/shipping/parcel-uncle/webhook';
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

// 13. Dispatch Pan-India Shipment via Courier Uncle Aggregator (Delhivery/Bluedart)
const dispatchCourierUncle = async (req, res) => {
  const { orderId, courierCode } = req.body;
  if (!orderId) return res.status(400).json({ message: 'Order ID is required' });

  try {
    const orderRes = await db.query(
      `SELECT o.*, u.email as customer_email, u.name as customer_name, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    const order = orderRes.rows[0];

    const dbItems = await db.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const cuResult = await courierUncle.createPanIndiaShipment({
      orderId: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      shippingAddress: order.shipping_address,
      items: dbItems.rows,
      totalAmount: order.total_amount,
      isCod: order.status === 'COD',
      courierCode
    });

    const waybill = cuResult.waybill || cuResult.tracking_number;
    const comments = `Pan-India Shipped via Courier Uncle (${cuResult.courier || 'Express'}) — AWB: ${waybill}`;

    await db.query(
      `UPDATE orders 
       SET status = 'Shipped',
           parcel_uncle_tracking_id = ?,
           parcel_uncle_status = ?,
           parcel_uncle_response = ?,
           courier_partner = ?,
           tracking_comments = ?
       WHERE id = ?`,
      [
        waybill,
        cuResult.status || 'CREATED',
        JSON.stringify(cuResult.rawResponse || cuResult),
        cuResult.courier || 'Courier Uncle Pan-India Express',
        comments,
        orderId
      ]
    );

    res.json({
      success: true,
      message: `Order #${orderId} successfully dispatched via Courier Uncle Pan-India Aggregator`,
      waybill,
      courier: cuResult.courier,
      shipment: cuResult
    });
  } catch (err) {
    console.error('Dispatch Courier Uncle error:', err);
    res.status(500).json({ message: 'Server error dispatching shipment via Courier Uncle' });
  }
};

// 14. Smart Auto-Routing Dispatch (Delhi NCR -> Parcel Uncle, Pan-India -> Courier Uncle)
const dispatchSmartShipment = async (req, res) => {
  const { orderId, forceCarrier } = req.body;
  if (!orderId) return res.status(400).json({ message: 'Order ID is required' });

  try {
    const orderRes = await db.query('SELECT shipping_address FROM orders WHERE id = ?', [orderId]);
    if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

    let parsedAddr = orderRes.rows[0].shipping_address;
    if (typeof parsedAddr === 'string') {
      try { parsedAddr = JSON.parse(parsedAddr); } catch (_) { parsedAddr = {}; }
    }

    const pincode = String(parsedAddr?.pincode || parsedAddr?.zip || '110014').trim();
    const isDelhiNcr = DELHI_NCR_PINCODE_PREFIXES.some(prefix => pincode.startsWith(prefix));

    if (forceCarrier === 'COURIER_UNCLE' || (!isDelhiNcr && forceCarrier !== 'PARCEL_UNCLE')) {
      return dispatchCourierUncle(req, res);
    } else {
      return dispatchParcelUncle(req, res);
    }
  } catch (err) {
    console.error('Smart dispatch error:', err);
    res.status(500).json({ message: 'Server error in smart auto-routing dispatch' });
  }
};

module.exports = {
  dispatchParcelUncle,
  dispatchCourierUncle,
  dispatchSmartShipment,
  trackParcelUncle,
  syncParcelUncleStatus,
  syncParcelUncleHandler,
  handleWebhook,
  cancelParcelUncle,
  cancelCourierUncle,
  cancelOrderAdmin,
  downloadLabel,
  registerWebhookHandler,
  getNdrListHandler,
  takeNdrActionHandler,
  checkServiceabilityHandler,
  getRateQuoteHandler,
  getConfig
};

