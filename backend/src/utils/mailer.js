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

const SMTP_EMAIL = process.env.SMTP_EMAIL || 'am8386757@gmail.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'fbceuzlrcumeejjb';

// ── Transporter (Gmail SMTP) ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
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
  if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    console.warn('[Mailer] SMTP credentials not set — skipping email');
    return null;
  }
  return transporter.sendMail({
    from: `"Lekya Specs" <${SMTP_EMAIL}>`,
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

// ── 6. Send OTP Verification Email ──────────────────────────────────────────
const sendOtpEmail = async ({ to, otp }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;border:1px solid #C5A028;border-radius:8px;overflow:hidden;">
      <div style="background:#121212;padding:32px;text-align:center;border-bottom:1px solid rgba(197,160,40,0.2);">
        <h1 style="color:#C5A028;margin:0;font-size:24px;letter-spacing:4px;">LEKYA SPECS</h1>
        <p style="color:#fff;margin:8px 0 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">Verification Portal</p>
      </div>
      <div style="padding:40px 32px;text-align:center;background:#121212;">
        <h2 style="color:#fff;margin:0 0 16px 0;font-weight:600;">Verify Your Registration</h2>
        <p style="color:#b3b3b3;font-size:14px;line-height:1.6;margin:0 0 32px 0;">Thank you for choosing Lekya Specs. Please enter the following 6-digit OTP code to complete your registration. This code is valid for 5 minutes.</p>
        <div style="background:#1A1A1A;border:1px dashed #C5A028;padding:24px;border-radius:6px;display:inline-block;margin-bottom:32px;">
          <span style="font-family:monospace;font-size:36px;font-weight:bold;color:#C5A028;letter-spacing:6px;display:block;">${otp}</span>
        </div>
        <p style="color:#777;font-size:12px;margin:0;">If you did not initiate this registration request, please ignore this email safely.</p>
      </div>
      <div style="background:#0d0d0d;padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.02);">
        <p style="color:#555;font-size:11px;margin:0;">&copy; 2026 Lekya Specs. Premium Eyewear &amp; AI Studio.</p>
      </div>
    </div>
  `;
  return sendMail({ to, subject: `${otp} is your Lekya Specs verification code`, html });
};

// ── 7. Delivery OTP Email (sent to customer when order goes Out for Delivery) ─
const sendDeliveryOtpEmail = async ({ to, customerName, orderId, otp }) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;border:1px solid #f59e0b;border-radius:10px;overflow:hidden;">
      <div style="background:#111;padding:32px;text-align:center;border-bottom:1px solid rgba(245,158,11,0.25);">
        <h1 style="color:#C5A028;margin:0;font-size:24px;letter-spacing:4px;">LEKYA SPECS</h1>
        <p style="color:#f59e0b;margin:6px 0 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;">Delivery Verification Code</p>
      </div>
      <div style="padding:40px 32px;text-align:center;background:#111;">
        <div style="font-size:32px;margin-bottom:16px;">🚚</div>
        <h2 style="color:#fff;margin:0 0 12px;font-size:20px;font-weight:700;">Your Order is Out for Delivery!</h2>
        <p style="color:#b3b3b3;font-size:13px;line-height:1.7;margin:0 0 28px;">
          Hi <strong style="color:#fff">${customerName || 'there'}</strong>,<br>
          Your <strong style="color:#f59e0b">Order #${orderId}</strong> is on its way!
          Please share this <strong>One-Time Password (OTP)</strong> with the delivery agent to confirm receipt.
        </p>
        <div style="background:#1a1a1a;border:2px dashed #f59e0b;border-radius:8px;padding:24px;display:inline-block;margin-bottom:28px;min-width:200px;">
          <p style="color:#6b7280;font-size:10px;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;">Delivery OTP</p>
          <span style="font-family:monospace;font-size:40px;font-weight:900;color:#f59e0b;letter-spacing:8px;">${otp}</span>
        </div>
        <p style="color:#ef4444;font-size:12px;font-weight:700;margin:0 0 8px;">⚠️ Do NOT share this OTP with anyone other than the delivery agent at your door.</p>
        <p style="color:#555;font-size:11px;margin:0;">If you did not place this order, please contact support immediately.</p>
      </div>
      <div style="background:#0d0d0d;padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.03);">
        <p style="color:#555;font-size:11px;margin:0;">© 2026 Lekya Specs. Premium Eyewear & AI Studio.</p>
      </div>
    </div>
  `;
  return sendMail({
    to,
    subject: `${otp} — Your Lekya Specs Delivery OTP for Order #${orderId}`,
    html
  });
};

// ── 8. Order Status Update Email (every status change) ──────────────────────
const sendStatusUpdateEmail = async ({ to, customerName, orderId, status, note, totalAmount }) => {

  // Status-specific config
  const STATUS_CONFIG = {
    'Payment Confirmed': { emoji: '✅', color: '#22c55e', title: 'Payment Confirmed!',        subtitle: 'Your payment was received. We\'re on it!' },
    'Processing':        { emoji: '⚙️', color: '#3b82f6', title: 'Order Being Processed',    subtitle: 'Our team is preparing your eyewear with care.' },
    'Packed':            { emoji: '📦', color: '#8b5cf6', title: 'Order Packed & Ready',      subtitle: 'Your order is packed and ready to ship!' },
    'Shipped':           { emoji: '🚚', color: '#f59e0b', title: 'Order Shipped!',            subtitle: 'Your order is on its way to you.' },
    'Out for Delivery':  { emoji: '🛵', color: '#f97316', title: 'Out for Delivery!',         subtitle: 'Your order is arriving today. Keep your OTP ready!' },
    'Delivered':         { emoji: '🎉', color: '#C5A028', title: 'Order Delivered!',          subtitle: 'Enjoy your new Lekya Specs eyewear!' },
    'Cancelled':         { emoji: '❌', color: '#ef4444', title: 'Order Cancelled',           subtitle: 'Your order has been cancelled.' },
    'Refunded':          { emoji: '💰', color: '#06b6d4', title: 'Refund Initiated',          subtitle: 'Your refund is being processed.' },
  };

  const ALL_STATUSES = ['Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const config = STATUS_CONFIG[status] || { emoji: '📋', color: '#C5A028', title: `Status: ${status}`, subtitle: 'Your order status has been updated.' };
  const currentIdx = ALL_STATUSES.indexOf(status);

  // Build the timeline steps
  const timelineRows = ALL_STATUSES.map((step, idx) => {
    const isDone   = idx < currentIdx;
    const isCurrent = idx === currentIdx;
    const stepCfg  = STATUS_CONFIG[step] || {};
    const dotColor = isDone ? '#22c55e' : isCurrent ? config.color : '#333';
    const textColor = isDone ? '#22c55e' : isCurrent ? config.color : '#555';
    const weight   = isCurrent ? '800' : isDone ? '600' : '400';
    return `
      <tr>
        <td style="width:28px;text-align:center;vertical-align:top;padding:4px 0;">
          <div style="width:18px;height:18px;border-radius:50%;background:${dotColor};display:inline-block;line-height:18px;font-size:10px;color:#000;text-align:center;font-weight:900;margin-top:2px;">
            ${isDone ? '✓' : isCurrent ? '●' : '○'}
          </div>
        </td>
        <td style="padding:6px 0 6px 12px;border-left:2px solid ${isDone || isCurrent ? dotColor : '#2a2a2a'};">
          <span style="font-size:12px;font-weight:${weight};color:${textColor};">${stepCfg.emoji || ''} ${step}</span>
          ${isCurrent ? `<div style="font-size:10px;color:#888;margin-top:2px;">${config.subtitle}</div>` : ''}
        </td>
      </tr>
      <tr><td style="height:4px;"></td><td></td></tr>`;
  }).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;border:1px solid ${config.color}44;border-radius:10px;overflow:hidden;">
      <div style="background:#111;padding:28px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
        <h1 style="color:#C5A028;margin:0;font-size:22px;letter-spacing:4px;">LEKYA SPECS</h1>
        <p style="color:#777;margin:4px 0 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Order Status Update</p>
      </div>

      <div style="padding:32px;background:#111;">
        <!-- Status Badge -->
        <div style="text-align:center;margin-bottom:28px;">
          <span style="font-size:36px;">${config.emoji}</span>
          <h2 style="color:#fff;margin:8px 0 4px;font-size:22px;font-weight:800;">${config.title}</h2>
          <p style="color:#aaa;font-size:13px;margin:0;">Hi <strong style="color:#fff">${customerName || 'there'}</strong>, here's an update on your order.</p>
          <div style="display:inline-block;background:${config.color}22;border:1px solid ${config.color}44;border-radius:999px;padding:4px 16px;margin-top:10px;">
            <span style="color:${config.color};font-size:11px;font-weight:700;letter-spacing:1px;">Order #${orderId}</span>
          </div>
        </div>

        <!-- Status Timeline -->
        <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
          <p style="color:#666;font-size:9px;text-transform:uppercase;letter-spacing:2px;margin:0 0 14px;">Delivery Progress</p>
          <table style="border-collapse:collapse;width:100%;">
            <tbody>${timelineRows}</tbody>
          </table>
        </div>

        ${note ? `
        <div style="background:#1a1a1a;border-left:3px solid ${config.color};border-radius:4px;padding:12px 16px;margin-bottom:24px;">
          <p style="color:#999;font-size:10px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Note from Team</p>
          <p style="color:#ddd;font-size:13px;margin:0;">${note}</p>
        </div>` : ''}

        ${totalAmount ? `
        <div style="display:flex;justify-content:space-between;align-items:center;background:#111;border:1px solid #2a2a2a;border-radius:6px;padding:12px 16px;margin-bottom:24px;">
          <span style="color:#666;font-size:12px;">Order Total</span>
          <span style="color:#C5A028;font-size:16px;font-weight:900;">₹${parseFloat(totalAmount).toLocaleString('en-IN')}</span>
        </div>` : ''}

        <!-- CTA -->
        <div style="text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account" 
             style="display:inline-block;background:${config.color};color:${status === 'Delivered' ? '#111' : '#111'};padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:800;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
            Track My Order →
          </a>
        </div>
      </div>

      <div style="background:#0d0d0d;padding:16px;text-align:center;border-top:1px solid #1a1a1a;">
        <p style="color:#444;font-size:11px;margin:0;">© 2026 Lekya Specs. Premium Eyewear & AI Studio.</p>
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject: `${config.emoji} Order #${orderId} — ${status} | Lekya Specs`,
    html
  });
};

module.exports = {
  sendMail,
  sendContactEmail,
  sendOrderConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBroadcastEmail,
  sendOtpEmail,
  sendDeliveryOtpEmail,
  sendStatusUpdateEmail,
};

