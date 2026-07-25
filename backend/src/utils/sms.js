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
async function sendSms({ to, message, route = 'q', variablesValues = null }) {
  const apiKey = process.env.FAST2SMS_API_KEY || 'HDf5Niu8mzYKA4j7QMPBaRqcWpV3y0swT9Z6nokxevGCX1Lrbhrbhi7PtXBFy0SITMvYLVfKG5A4Zq1g';
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
    const payload = {
      route,
      numbers: formattedPhone
    };
    if (route === 'otp' && variablesValues) {
      payload.variables_values = variablesValues;
    } else {
      payload.message = message;
    }

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (data.return) {
      console.log(`[SMS] Sent to ${formattedPhone} via route '${route}': "${message.slice(0, 40)}..."`);
      return data;
    } else {
      console.error(`[SMS] Fast2SMS error:`, data);
      // If OTP route failed, try fallback to transactional route 'q'
      if (route === 'otp') {
        return sendSms({ to, message, route: 'q' });
      }
      return null;
    }
  } catch (err) {
    console.error(`[SMS] Request failed to ${formattedPhone}:`, err.message);
    return null;
  }
}

// ── 1. OTP SMS ────────────────────────────────────────────────────────────────
async function sendOtpSms({ to, otp }) {
  return sendSms({
    to,
    message: `Your Lekya Specs verification code is: ${otp}. Do not share this with anyone.`,
    route: 'otp',
    variablesValues: otp
  });
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

