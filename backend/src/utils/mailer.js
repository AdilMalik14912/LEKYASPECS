/**
 * mailer.js — Google SMTP Email Service via Nodemailer
 *
 * Uses Gmail App Password (set in .env):
 *   SMTP_EMAIL=your@gmail.com
 *   SMTP_PASSWORD=your_16char_app_password
 *
 * Usage:
 *   const { sendMail, sendContactEmail, sendOrderConfirmation, sendWelcomeEmail } = require('./mailer');
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// ── Transporter (Gmail SMTP) ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify connection on startup (non-blocking)
transporter.verify((err) => {
  if (err) {
    console.warn('[Mailer] SMTP connection warning:', err.message);
  } else {
    console.log('[Mailer] Gmail SMTP ready ✓');
  }
});

// ── Base send function ─────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('[Mailer] SMTP credentials not set — skipping email');
    return null;
  }
  return transporter.sendMail({
    from: `"Lekya Specs" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  });
};

// ── 1. Contact Us Email (sent to admin) ───────────────────────────────────
const sendContactEmail = async ({ name, email, phone, subject, message }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
      <div style="background:#1a1a1a;padding:24px;text-align:center;">
        <h1 style="color:#C5A028;margin:0;font-size:22px;letter-spacing:3px;">LEKYA SPECS</h1>
        <p style="color:#999;margin:4px 0 0;font-size:12px;">New Contact Form Submission</p>
      </div>
      <div style="padding:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;font-size:13px;width:100px;">Name</td><td style="padding:8px 0;font-weight:bold;color:#1a1a1a;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;">Email</td><td style="padding:8px 0;font-weight:bold;color:#C5A028;"><a href="mailto:${email}" style="color:#C5A028;">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;">Phone</td><td style="padding:8px 0;font-weight:bold;color:#1a1a1a;">${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;">Subject</td><td style="padding:8px 0;font-weight:bold;color:#1a1a1a;">${subject}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px;background:#f9f9f9;border-left:4px solid #C5A028;border-radius:4px;">
          <p style="color:#666;font-size:12px;margin:0 0 8px;">Message:</p>
          <p style="color:#1a1a1a;margin:0;line-height:1.6;">${message}</p>
        </div>
      </div>
      <div style="background:#f5f5f5;padding:16px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">Lekya Specs — Premium Eyewear Platform</p>
      </div>
    </div>
  `;

  // Send to admin
  await sendMail({
    to: process.env.SMTP_EMAIL,
    subject: `[Contact] ${subject} — from ${name}`,
    html,
  });

  // Auto-reply to user
  await sendMail({
    to: email,
    subject: 'We received your message — Lekya Specs',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <div style="background:#1a1a1a;padding:24px;text-align:center;">
          <h1 style="color:#C5A028;margin:0;font-size:22px;letter-spacing:3px;">LEKYA SPECS</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a1a1a;font-size:20px;">Thank you, ${name}! 🙏</h2>
          <p style="color:#555;line-height:1.6;">We've received your message and our team will get back to you within <strong>24 hours</strong>.</p>
          <div style="margin:24px 0;padding:16px;background:#f9f9f9;border-left:4px solid #C5A028;border-radius:4px;">
            <p style="color:#666;font-size:12px;margin:0 0 4px;">Your message:</p>
            <p style="color:#1a1a1a;margin:0;font-style:italic;">"${message}"</p>
          </div>
          <p style="color:#555;">Visit our store: <a href="http://localhost:3000" style="color:#C5A028;">Lekya Specs</a></p>
        </div>
        <div style="background:#f5f5f5;padding:16px;text-align:center;">
          <p style="color:#999;font-size:11px;margin:0;">© 2026 Lekya Specs. Premium Eyewear.</p>
        </div>
      </div>
    `,
  });
};

// ── 2. Order Confirmation Email ────────────────────────────────────────────
const sendOrderConfirmation = async ({ to, userName, orderId, items, totalAmount, shippingAddress }) => {
  const itemRows = (items || []).map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#1a1a1a;">${item.name}</td>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:center;color:#666;">×${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:right;color:#C5A028;font-weight:bold;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
      <div style="background:#1a1a1a;padding:32px;text-align:center;">
        <h1 style="color:#C5A028;margin:0;font-size:24px;letter-spacing:3px;">LEKYA SPECS</h1>
        <p style="color:#fff;margin:8px 0 0;font-size:16px;">Order Confirmed! 🎉</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1a1a1a;font-size:18px;">Hi ${userName},</h2>
        <p style="color:#555;">Your order <strong style="color:#C5A028;">#${orderId}</strong> has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f9f9f9;">
              <th style="padding:10px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Product</th>
              <th style="padding:10px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Qty</th>
              <th style="padding:10px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 10px;font-weight:bold;color:#1a1a1a;font-size:16px;">Total</td>
              <td style="padding:12px 10px;font-weight:bold;color:#C5A028;font-size:18px;text-align:right;">₹${parseFloat(totalAmount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        ${shippingAddress ? `
        <div style="padding:16px;background:#f9f9f9;border-radius:6px;margin-top:16px;">
          <p style="font-size:12px;color:#666;text-transform:uppercase;margin:0 0 8px;">Shipping To</p>
          <p style="margin:0;color:#1a1a1a;">${shippingAddress.name || ''}<br>${shippingAddress.address || ''}, ${shippingAddress.city || ''}<br>${shippingAddress.pincode || ''}</p>
        </div>` : ''}
      </div>
      <div style="background:#f5f5f5;padding:16px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">© 2026 Lekya Specs. Premium Eyewear.</p>
      </div>
    </div>
  `;

  return sendMail({ to, subject: `Order Confirmed #${orderId} — Lekya Specs`, html });
};

// ── 3. Welcome Email (after registration) ─────────────────────────────────
const sendWelcomeEmail = async ({ to, name }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
      <div style="background:#1a1a1a;padding:32px;text-align:center;">
        <h1 style="color:#C5A028;margin:0;font-size:24px;letter-spacing:3px;">LEKYA SPECS</h1>
        <p style="color:#fff;margin:8px 0 0;">Welcome to the family! 👋</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1a1a1a;">Hi ${name},</h2>
        <p style="color:#555;line-height:1.6;">Welcome to <strong>Lekya Specs</strong> — your destination for premium eyewear. Your account is now active!</p>
        <div style="margin:24px 0;display:flex;gap:12px;">
          <div style="flex:1;padding:16px;background:#f9f9f9;border-radius:6px;text-align:center;">
            <p style="font-size:24px;margin:0;">🕶️</p>
            <p style="font-size:12px;color:#666;margin:4px 0 0;">Browse 500+ frames</p>
          </div>
          <div style="flex:1;padding:16px;background:#f9f9f9;border-radius:6px;text-align:center;">
            <p style="font-size:24px;margin:0;">🤖</p>
            <p style="font-size:12px;color:#666;margin:4px 0 0;">AI Face Shape Finder</p>
          </div>
          <div style="flex:1;padding:16px;background:#f9f9f9;border-radius:6px;text-align:center;">
            <p style="font-size:24px;margin:0;">🎁</p>
            <p style="font-size:12px;color:#666;margin:4px 0 0;">Use code WELCOME10</p>
          </div>
        </div>
        <p style="color:#555;">Use coupon <strong style="color:#C5A028;">WELCOME10</strong> for 10% off your first order!</p>
      </div>
      <div style="background:#f5f5f5;padding:16px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">© 2026 Lekya Specs. Premium Eyewear.</p>
      </div>
    </div>
  `;
  return sendMail({ to, subject: 'Welcome to Lekya Specs! 🕶️', html });
};

// ── 4. Password Reset Email ────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, name, resetLink }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
      <div style="background:#1a1a1a;padding:24px;text-align:center;">
        <h1 style="color:#C5A028;margin:0;font-size:22px;letter-spacing:3px;">LEKYA SPECS</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1a1a1a;">Password Reset Request</h2>
        <p style="color:#555;">Hi ${name}, we received a request to reset your password.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetLink}" style="background:#C5A028;color:#1a1a1a;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;letter-spacing:1px;">Reset Password</a>
        </div>
        <p style="color:#999;font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `;
  return sendMail({ to, subject: 'Reset Your Password — Lekya Specs', html });
};

// ── 5. Broadcast Promotional Email ─────────────────────────────────────────
const sendBroadcastEmail = async ({ to, subject, bodyHtml }) => {
  const trimmed = bodyHtml.trim();
  const isFullHtml = trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.toLowerCase().includes('<body');
  const html = isFullHtml ? bodyHtml : `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
      <div style="background:#1a1a1a;padding:32px;text-align:center;">
        <h1 style="color:#C5A028;margin:0;font-size:24px;letter-spacing:3px;">LEKYA SPECS</h1>
        <p style="color:#fff;margin:8px 0 0;font-size:13px;">Exclusive Update from Lekya Specs</p>
      </div>
      <div style="padding:32px;">
        ${bodyHtml}
      </div>
      <div style="background:#f5f5f5;padding:16px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;">© 2026 Lekya Specs. Premium Eyewear. You're receiving this because you're a registered customer.</p>
      </div>
    </div>
  `;
  return sendMail({ to, subject, html });
};

module.exports = {
  sendMail,
  sendContactEmail,
  sendOrderConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBroadcastEmail,
};
