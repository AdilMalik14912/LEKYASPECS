/**
 * whatsappWebhookController.js
 * WhatsApp Business Cloud API — Incoming Message Handler & Auto-Reply Engine
 * 
 * Setup required (Meta Developer Console):
 *   1. Create a Meta App at https://developers.facebook.com
 *   2. Add WhatsApp product → get PHONE_NUMBER_ID
 *   3. Generate Permanent Access Token → WHATSAPP_ACCESS_TOKEN
 *   4. Set webhook URL: https://your-backend.vercel.app/api/webhooks/whatsapp
 *   5. Set WHATSAPP_WEBHOOK_VERIFY_TOKEN (any secret string you choose)
 *   6. Subscribe to "messages" webhook field
 */

require('dotenv').config();
const db = require('../config/db');

const WA_PHONE_NUMBER_ID  = process.env.WA_PHONE_NUMBER_ID;
const WA_ACCESS_TOKEN     = process.env.WA_ACCESS_TOKEN;
const WA_VERIFY_TOKEN     = process.env.WA_WEBHOOK_VERIFY_TOKEN || 'lekya_specs_webhook_2024';
const WA_API_BASE         = `https://graph.facebook.com/v19.0`;

// ─── Intelligent Auto-Reply Rules ────────────────────────────────────────────
// Each rule has: keywords (lowercase), and a reply generator function
const AUTO_REPLY_RULES = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hii', 'hey', 'namaste', 'helo', 'hlo', 'namaskar', 'good morning', 'good afternoon', 'good evening'],
    reply: (name) => `🕶️ *Namaste${name ? `, ${name}` : ''}! Welcome to Lekya Specs* ✨\n\nYour Premium Eyewear Concierge is here! How can I assist you today?\n\n👇 *Reply with a number to get started:*\n1️⃣ Track my order\n2️⃣ Browse frames & sunglasses\n3️⃣ Frame consultation (find perfect fit)\n4️⃣ Prescription & lens query\n5️⃣ Return or exchange request\n6️⃣ Speak to a human agent\n\n_Lekya Specs — Luxury Eyewear, Delivered to You._`
  },
  {
    id: 'track_order',
    keywords: ['track', 'order status', 'where is my order', 'delivery status', 'shipment', 'dispatch', 'shipped', '1'],
    reply: (name) => `📦 *Order Tracking — Lekya Specs*\n\nDear${name ? ` ${name}` : ''}, to track your order instantly:\n\n🌐 Visit: *lekyaspecs.in/track*\n📱 Or login to your account → My Orders\n\n*Order ID format:* #LS12345\n\nPlease share your *Order ID* here and I'll fetch the status for you right away! 🔍`
  },
  {
    id: 'browse',
    keywords: ['frames', 'sunglasses', 'collection', 'products', 'price', 'shop', 'buy', 'purchase', '2', 'eyeglasses', 'spectacles'],
    reply: () => `👓 *Lekya Specs Collection*\n\n✨ Explore our premium range:\n🔗 *Shop All Frames:* lekyaspecs.in/shop\n🔗 *Lookbook:* lekyaspecs.in/lookbook\n🔗 *AR Try-On:* lekyaspecs.in/ar-tryon\n\n💰 *Price Range:* ₹999 — ₹8,999\n🚀 *Free Shipping* on orders above ₹1,999\n🎁 Use code *WELCOME10* for 10% off your first order!\n\nNeed help finding the perfect frame for your face shape? Reply *3* for a free style consultation! 🎨`
  },
  {
    id: 'consultation',
    keywords: ['consultation', 'face shape', 'which frame', 'suggest', 'recommend', 'help choose', '3', 'style'],
    reply: () => `👓 *Free Frame Consultation — Lekya Specs*\n\nOur optical stylists are ready to help you find your perfect frame! 🎨\n\nPlease share:\n1. 📸 A *front-facing photo* of your face\n2. Your *face shape* (round/oval/square/heart) — or use our AI detector at lekyaspecs.in/face-shape\n3. Your *style preference* (classic/trendy/minimalist/bold)\n\n_A stylist will personally recommend frames within 2 hours!_ ⏰`
  },
  {
    id: 'prescription',
    keywords: ['prescription', 'lens', 'power', 'sph', 'cyl', 'axis', 'pd', 'number', 'minus', 'plus', '4', 'lenses', 'anti glare', 'blue light', 'photochromic'],
    reply: () => `🔬 *Prescription Lens Service — Lekya Specs*\n\nWe offer premium lenses for all prescriptions:\n\n📋 *Lens Options:*\n• Standard 1.56 Index (Basic)\n• Thin 1.61 Index (+₹800)\n• Ultra-thin 1.67 Index (+₹1,600)\n• Super slim 1.74 Index (+₹2,800)\n\n✨ *Coatings Available:*\n• Anti-Glare (+₹250)\n• Blue Light Shield (+₹300)\n• Photochromic/Sunswitch (+₹600)\n\nShare your prescription here or visit lekyaspecs.in/lens-guide for a complete guide. Our optician will assist you! 🕶️`
  },
  {
    id: 'return',
    keywords: ['return', 'exchange', 'refund', 'replace', 'broken', 'damaged', 'defective', '5', 'warranty'],
    reply: () => `↩️ *Returns & Exchange Policy — Lekya Specs*\n\n✅ *7-Day Easy Returns* — No questions asked\n🔄 *Free Exchange* — Switch frames within 15 days\n💰 *Full Refund* — Processed in 3-5 business days\n🛡️ *1-Year Warranty* on all frames\n\n📋 *To initiate a return:*\n1. Share your *Order ID*\n2. Reason for return\n3. Photos of the product\n\nOur team will arrange a free pickup! 🚚\n\n_Lekya Promise: 100% Customer Satisfaction Guarantee_`
  },
  {
    id: 'human',
    keywords: ['agent', 'human', 'person', 'talk', 'connect', '6', 'call', 'phone', 'support'],
    reply: () => `👤 *Connecting You to Our Team*\n\nOur customer support team is available:\n\n🕐 *Hours:* Mon–Sat, 10am – 7pm IST\n📞 *Phone:* +91 9654119262\n📧 *Email:* care@lekyaspecs.in\n💬 *Live Chat:* lekyaspecs.in/chat\n\nA team member will respond to this WhatsApp within *15 minutes* during business hours! ⚡\n\n_For urgent queries, please call directly._`
  },
  {
    id: 'thank_you',
    keywords: ['thank', 'thanks', 'thankyou', 'thank you', 'shukriya', 'dhanyawad'],
    reply: (name) => `🙏 *You're most welcome${name ? `, ${name}` : ''}!*\n\nIt's our pleasure to assist you! 😊\n\nIs there anything else I can help you with today?\n\n_Lekya Specs — Your Luxury Eyewear Partner_ 🕶️✨`
  },
  {
    id: 'coupon',
    keywords: ['coupon', 'discount', 'offer', 'promo', 'code', 'voucher', 'deal'],
    reply: () => `🎁 *Exclusive Lekya Specs Offers!*\n\n🔥 *Active Coupons:*\n• *WELCOME10* — 10% off your first order\n• *LEKYA20* — 20% off on orders above ₹2,999\n• *FREESHIP* — Free shipping on any order\n\n🎡 *Spin & Win daily on our website for extra rewards!*\n🔗 Visit: lekyaspecs.in\n\nHappy shopping! 🛍️`
  },
];

// Fallback reply for unrecognized messages
const FALLBACK_REPLY = (name) =>
  `👋 *Hi${name ? ` ${name}` : ''}! Thanks for reaching out to Lekya Specs!* 🕶️\n\nI'm your automatic assistant. Here's what I can help with:\n\n1️⃣ Track my order\n2️⃣ Browse frames & sunglasses\n3️⃣ Frame consultation\n4️⃣ Prescription & lens query\n5️⃣ Return or exchange request\n6️⃣ Speak to a human agent\n\n_Reply with a number or describe what you need!_\n\nOur team is also available at *+91 9654119262* (Mon–Sat, 10am–7pm IST) 📞`;

// ─── Detect intent from message text ─────────────────────────────────────────
function detectIntent(messageText) {
  const lower = messageText.toLowerCase().trim();
  for (const rule of AUTO_REPLY_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw) || lower === kw)) {
      return rule;
    }
  }
  return null;
}

// ─── Send WhatsApp text message via Cloud API ─────────────────────────────────
async function sendWhatsAppReply(to, messageText) {
  if (!WA_PHONE_NUMBER_ID || !WA_ACCESS_TOKEN) {
    console.log(`[WA AUTO-REPLY SIMULATION] To: +${to}\nMessage: ${messageText.slice(0, 80)}...`);
    return { simulated: true };
  }

  const url = `${WA_API_BASE}/${WA_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: false,
      body: messageText
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[WA AUTO-REPLY ERROR]', JSON.stringify(data));
      return { success: false, error: data };
    }
    console.log(`[WA AUTO-REPLY SENT] → +${to}`);
    return { success: true, data };
  } catch (err) {
    console.error('[WA AUTO-REPLY EXCEPTION]', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Mark message as read (double tick) ──────────────────────────────────────
async function markAsRead(messageId) {
  if (!WA_PHONE_NUMBER_ID || !WA_ACCESS_TOKEN) return;
  try {
    await fetch(`${WA_API_BASE}/${WA_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WA_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    });
  } catch (_) {}
}

// ─── Look up customer name from DB by phone ───────────────────────────────────
async function getCustomerNameByPhone(phone) {
  try {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10); // last 10 digits
    const res = await db.query(
      'SELECT name FROM users WHERE phone LIKE ? LIMIT 1',
      [`%${cleanPhone}`]
    );
    return res.rows.length > 0 ? res.rows[0].name.split(' ')[0] : null;
  } catch (_) {
    return null;
  }
}

// ─── Log incoming message to DB for CRM ──────────────────────────────────────
async function logIncomingMessage({ from, name, body, intent, replied }) {
  try {
    await db.query(
      `INSERT INTO whatsapp_messages (phone, customer_name, message_body, detected_intent, auto_replied, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT DO NOTHING`,
      [from, name || 'Unknown', body?.slice(0, 1000), intent || 'unknown', replied ? 1 : 0]
    );
  } catch (_) {
    // Table may not exist yet — silently ignore, logging is non-critical
  }
}

// ─── WEBHOOK VERIFICATION (GET) ───────────────────────────────────────────────
function verifyWebhook(req, res) {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[WA WEBHOOK] Verification attempt — mode:', mode, '| token match:', token === WA_VERIFY_TOKEN);

  if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) {
    console.log('[WA WEBHOOK] ✅ Verified successfully');
    return res.status(200).send(challenge);
  }
  console.warn('[WA WEBHOOK] ❌ Verification failed — token mismatch');
  return res.sendStatus(403);
}

// ─── INCOMING MESSAGE HANDLER (POST) ─────────────────────────────────────────
async function handleIncomingMessage(req, res) {
  // Always respond 200 immediately (Meta requires this)
  res.sendStatus(200);

  try {
    const body = req.body;

    // Validate structure
    if (body?.object !== 'whatsapp_business_account') return;

    const entry   = body.entry?.[0];
    const change  = entry?.changes?.[0];
    const value   = change?.value;

    // Only handle actual messages (not status updates)
    if (!value?.messages || value.messages.length === 0) return;

    const message = value.messages[0];
    const from    = message.from; // sender's phone number (international, no +)
    const msgId   = message.id;
    const msgType = message.type;

    // Extract display name from contacts metadata
    const contactName = value?.contacts?.[0]?.profile?.name || null;

    // Only handle text messages for auto-reply
    if (msgType !== 'text') {
      // For non-text (image, audio, etc.) send a friendly acknowledgment
      const customerName = await getCustomerNameByPhone(from);
      const name = contactName || customerName;
      await markAsRead(msgId);
      await sendWhatsAppReply(from,
        `👋 *Hi${name ? ` ${name}` : ''}!* Thanks for your message!\n\nI received your ${msgType}. Our team will review it and get back to you shortly.\n\nFor quick help, type *1* to track your order or *6* to speak to a human agent! 😊`
      );
      await logIncomingMessage({ from, name, body: `[${msgType} message]`, intent: 'media', replied: true });
      return;
    }

    const textBody = message.text?.body || '';
    if (!textBody.trim()) return;

    // Mark as read
    await markAsRead(msgId);

    // Get customer name from contacts or DB
    const dbName = await getCustomerNameByPhone(from);
    const name   = contactName || dbName;

    // Detect intent
    const rule = detectIntent(textBody);
    const replyText = rule
      ? rule.reply(name)
      : FALLBACK_REPLY(name);

    // Send auto-reply
    await sendWhatsAppReply(from, replyText);

    // Log to DB (non-blocking)
    await logIncomingMessage({
      from,
      name,
      body: textBody,
      intent: rule?.id || 'fallback',
      replied: true
    });

    console.log(`[WA AUTO-REPLY] from=+${from} | intent=${rule?.id || 'fallback'} | name=${name || 'Unknown'}`);

  } catch (err) {
    console.error('[WA WEBHOOK HANDLER ERROR]', err.message);
  }
}

module.exports = { verifyWebhook, handleIncomingMessage };
