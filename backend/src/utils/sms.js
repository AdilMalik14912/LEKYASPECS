/**
 * sms.js — SMS Gateway Integration (Fast2SMS bulk API)
 *
 * Uses Fast2SMS API Key from .env:
 *   FAST2SMS_API_KEY=your_fast2sms_api_key
 *
 * Route: otp → for OTP messages
 * Route: q   → for transactional messages
 */

// ── Internal helper: send any SMS ────────────────────────────────────────────
async function sendSms({ to, message }) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.warn(`[SMS] FAST2SMS_API_KEY not set — skipped. Message: ${message}`);
    return null;
  }
  const cleanPhone = to.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    console.warn(`[SMS] Invalid phone number: ${cleanPhone}`);
    return null;
  }
  const formattedPhone = cleanPhone.slice(-10);
  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message,
        numbers: formattedPhone
      })
    });
    const data = await response.json();
    if (data.return) {
      console.log(`[SMS] Sent to ${formattedPhone}: "${message.slice(0, 40)}..."`);
      return data;
    } else {
      console.error(`[SMS] Fast2SMS error:`, data);
      return null;
    }
  } catch (err) {
    console.error(`[SMS] Request failed to ${formattedPhone}:`, err.message);
    return null;
  }
}

// ── 1. OTP SMS ────────────────────────────────────────────────────────────────
async function sendOtpSms({ to, otp }) {
  return sendSms({ to, message: `Your Lekya Specs verification code is: ${otp}. Do not share this with anyone.` });
}

// ── 2. Order Status Update SMS ────────────────────────────────────────────────
async function sendStatusUpdateSms({ to, customerName, orderId, status, note }) {
  const statusMessages = {
    'Payment Confirmed': `Hi ${customerName}! Your Lekya Specs payment for Order #${orderId} is confirmed. We'll start processing shortly.`,
    'Processing':        `Hi ${customerName}! Order #${orderId} is now being processed at our warehouse. Sit tight!`,
    'Packed':            `Hi ${customerName}! Order #${orderId} is packed and ready to ship. It'll leave our warehouse soon.`,
    'Shipped':           `Hi ${customerName}! Your Order #${orderId} has been shipped and is on its way. Track it on our website.`,
    'Out for Delivery':  `Hi ${customerName}! Your Order #${orderId} is out for delivery today! Keep your phone handy for the OTP.`,
    'Delivered':         `Hi ${customerName}! Your Order #${orderId} has been delivered. Thank you for shopping with Lekya Specs! 🕶️`,
    'Cancelled':         `Hi ${customerName}! Your Order #${orderId} has been cancelled. Refunds (if any) will process in 5-7 days.`,
    'Refunded':          `Hi ${customerName}! Refund for Order #${orderId} has been initiated. Please allow 5-7 business days.`,
  };
  const message = (statusMessages[status] || `Hi ${customerName}! Your Lekya Specs Order #${orderId} status is now: ${status}.`)
    + (note ? ` Note: ${note}` : '');
  return sendSms({ to, message });
}

module.exports = { sendOtpSms, sendStatusUpdateSms };

