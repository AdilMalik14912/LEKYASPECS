/**
 * whatsapp.js — WhatsApp Business Notification & Concierge Gateway
 */

require('dotenv').config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0/me/messages';
const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN || null;

/**
 * Send WhatsApp Interactive Message / Template Alert
 */
async function sendWhatsAppNotification({ phone, customerName, orderId, status, trackingUrl, invoiceUrl, note }) {
  if (!phone) return { success: false, message: 'Phone number missing' };

  const cleanPhone = String(phone).replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "text",
    text: {
      body: `🕶️ *Lekya Specs Order Update*\n\nDear *${customerName || 'Valued Customer'}*,\nYour Order *#${orderId}* status is now: *${status.toUpperCase()}*.\n\n${note ? '📌 *Note:* ' + note + '\n\n' : ''}${trackingUrl ? '📦 *Track Shipment:* ' + trackingUrl + '\n' : ''}${invoiceUrl ? '📄 *Tax Invoice:* ' + invoiceUrl + '\n' : ''}\nThank you for choosing Lekya Specs Luxury Eyewear!`
    }
  };

  try {
    if (WHATSAPP_TOKEN) {
      const response = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        console.log(`[WHATSAPP SUCCESS] Notification sent to ${formattedPhone} for Order #${orderId}`);
        return { success: true };
      }
    }
    console.log(`[WHATSAPP SIMULATION] Message to +${formattedPhone}: "Order #${orderId} -> ${status}"`);
    return { success: true, simulated: true };
  } catch (err) {
    console.warn('[WHATSAPP GATEWAY NOTE]', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendWhatsAppNotification
};
