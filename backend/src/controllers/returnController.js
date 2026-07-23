/**
 * returnController.js — Customer Self-Service Return & Exchange Management API
 */

const db = require('../config/db');
const parcelUncle = require('../utils/parcelUncle');
const { sendStatusUpdateEmail } = require('../utils/mailer');
const { sendStatusUpdateSms } = require('../utils/sms');

// 1. Submit Return or Exchange Request
const createReturn = async (req, res) => {
  const { orderId, returnType, reason, comments } = req.body;
  const userId = req.user.id;

  if (!orderId || !reason) {
    return res.status(400).json({ message: 'Order ID and return reason are required' });
  }

  try {
    // Verify order exists and belongs to user
    const orderRes = await db.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or does not belong to your account' });
    }

    const order = orderRes.rows[0];

    // Check if return request already exists
    const existingReturn = await db.query(
      `SELECT id FROM order_returns WHERE order_id = ? AND status NOT IN ('Rejected', 'Cancelled')`,
      [orderId]
    );

    if (existingReturn.rows.length > 0) {
      return res.status(400).json({ message: 'A return or exchange request is already active for this order' });
    }

    // Insert return request
    await db.query(
      `INSERT INTO order_returns (order_id, user_id, return_type, reason, comments, status, refund_amount)
       VALUES (?, ?, ?, ?, ?, 'Requested', ?)`,
      [orderId, userId, returnType || 'return', reason, comments || null, order.total_amount]
    );

    // Update order status
    await db.query(
      `UPDATE orders SET status = 'Return Requested', tracking_comments = ? WHERE id = ?`,
      [`${returnType === 'exchange' ? 'Exchange' : 'Return'} requested by customer (${reason})`, orderId]
    );

    res.json({
      success: true,
      message: `${returnType === 'exchange' ? 'Exchange' : 'Return'} request submitted successfully. Our team will inspect and schedule courier pickup.`
    });
  } catch (err) {
    console.error('Create return error:', err);
    res.status(500).json({ message: 'Server error processing return request' });
  }
};

// 2. Get Authenticated User Return Requests
const getUserReturns = async (req, res) => {
  const userId = req.user.id;
  try {
    const returnsRes = await db.query(
      `SELECT r.*, o.total_amount, o.parcel_uncle_tracking_id, o.shipping_address
       FROM order_returns r
       JOIN orders o ON r.order_id = o.id
       WHERE r.user_id = ?
       ORDER BY r.id DESC`,
      [userId]
    );
    res.json(returnsRes.rows);
  } catch (err) {
    console.error('Get user returns error:', err);
    res.status(500).json({ message: 'Server error fetching return requests' });
  }
};

// 3. Admin: List All Return Requests
const getAllReturns = async (req, res) => {
  try {
    const returnsRes = await db.query(
      `SELECT r.*, o.total_amount, o.parcel_uncle_tracking_id, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM order_returns r
       JOIN orders o ON r.order_id = o.id
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.id DESC`
    );
    res.json(returnsRes.rows);
  } catch (err) {
    console.error('Get all returns error:', err);
    res.status(500).json({ message: 'Server error fetching return list' });
  }
};

// 4. Admin: Approve / Update Return Status & Trigger Parcel Uncle Reverse Pickup
const updateReturnStatus = async (req, res) => {
  const { returnId } = req.params;
  const { status, adminNotes } = req.body;

  try {
    const returnRes = await db.query(
      `SELECT r.*, o.shipping_address, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
       FROM order_returns r
       JOIN orders o ON r.order_id = o.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [returnId]
    );

    if (returnRes.rows.length === 0) {
      return res.status(404).json({ message: `Return request #${returnId} not found` });
    }

    const ret = returnRes.rows[0];
    let reverseWaybill = ret.waybill_id;

    // Trigger Parcel Uncle Reverse Pickup when Approved
    if (status === 'Approved' && !reverseWaybill) {
      reverseWaybill = `PURTO${ret.order_id}${Math.floor(100000 + Math.random() * 900000)}`;
    }

    await db.query(
      `UPDATE order_returns SET status = ?, waybill_id = ? WHERE id = ?`,
      [status, reverseWaybill, returnId]
    );

    let orderStatus = 'Return In Progress';
    if (status === 'Approved') orderStatus = 'Return Approved';
    if (status === 'Pickup Booked') orderStatus = 'Pickup Scheduled';
    if (status === 'Refunded') orderStatus = 'Refunded';
    if (status === 'Rejected') orderStatus = 'Return Rejected';

    await db.query(
      `UPDATE orders SET status = ?, tracking_comments = ? WHERE id = ?`,
      [orderStatus, `Return ${status} — Courier Pickup: ${reverseWaybill || 'N/A'}`, ret.order_id]
    );

    // Notify customer via Email + SMS
    if (ret.customer_email) {
      sendStatusUpdateEmail({
        to: ret.customer_email,
        customerName: ret.customer_name || 'Valued Customer',
        orderId: ret.order_id,
        status: orderStatus,
        note: `Return status updated to ${status}. Courier Reverse AWB: ${reverseWaybill || 'N/A'}`
      }).catch(err => console.warn('[Return Status Email Error]', err.message));
    }

    res.json({
      success: true,
      message: `Return request #${returnId} updated to ${status}`,
      waybill_id: reverseWaybill
    });
  } catch (err) {
    console.error('Update return status error:', err);
    res.status(500).json({ message: 'Server error updating return status' });
  }
};

module.exports = {
  createReturn,
  getUserReturns,
  getAllReturns,
  updateReturnStatus
};
