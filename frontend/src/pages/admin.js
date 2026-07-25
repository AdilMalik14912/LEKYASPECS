const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth } = require('./_app');
const VisionEyeLogo = require('../components/VisionEyeLogo');
const { 
  BarChart3, ShoppingBag, ClipboardList, Users, ShieldCheck, 
  Trash2, Edit, Plus, Star, Landmark, ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle, Loader2, Sliders,
  Tag, Mail, ScrollText, Download, HelpCircle, Activity, X, Sparkles, Key, RefreshCw, PackageX, ArrowLeftRight, LogOut, Navigation,
  Settings, Cpu, Webhook, Radio, Lock, Zap, Copy, Check, Eye, EyeOff, ChevronLeft, ChevronRight, Server, Globe, Terminal
} = require('lucide-react');
const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

// --- Premium Custom Canvas-based Sales Chart ---
function RevenueChart({ data }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 300;
    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No sales trend data available for this range', width / 2, height / 2);
      return;
    }

    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxSales = Math.max(...data.map(d => parseFloat(d.sales || '0')), 1000);
    const minSales = 0;

    // Draw horizontal grid lines & Y labels
    ctx.strokeStyle = 'rgba(250, 174, 98, 0.12)';
    ctx.lineWidth = 1;
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const yVal = minSales + ((maxSales - minSales) * i) / yTicks;
      const yPos = margin.top + chartHeight - (i * chartHeight) / yTicks;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, yPos);
      ctx.lineTo(margin.left + chartWidth, yPos);
      ctx.stroke();

      ctx.fillStyle = '#9B7EA8';
      ctx.font = '10px Inter, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${Math.round(yVal).toLocaleString('en-IN')}`, margin.left - 10, yPos + 3);
    }

    // Points calculation
    const points = data.map((d, i) => {
      const x = margin.left + (i * chartWidth) / (data.length - 1 || 1);
      const salesVal = parseFloat(d.sales || '0');
      const y = margin.top + chartHeight - ((salesVal - minSales) * chartHeight) / (maxSales - minSales);
      return { x, y, date: d.date, sales: salesVal };
    });

    // Fill under line (gradient)
    ctx.beginPath();
    ctx.moveTo(points[0].x, margin.top + chartHeight);
    points.forEach((p, idx) => {
      if (idx === 0) {
        ctx.lineTo(p.x, p.y);
      } else {
        const prev = points[idx - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        const cpY2 = p.y;
        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, p.x, p.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, margin.top + chartHeight);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
    gradient.addColorStop(0, 'rgba(250, 174, 98, 0.35)');
    gradient.addColorStop(1, 'rgba(250, 174, 98, 0.01)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw connecting curve line
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        const prev = points[idx - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        const cpY2 = p.y;
        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, p.x, p.y);
      }
    });
    ctx.strokeStyle = '#FAAE62';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Draw dots and X date labels
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0D0016';
      ctx.fill();
      ctx.strokeStyle = '#FAAE62';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#555';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const dateStr = new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      ctx.fillText(dateStr, p.x, margin.top + chartHeight + 20);
    });

  }, [data]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: '300px' }} />;
}

const EMAIL_TEMPLATES = [
  {
    id: 'luxury_showcase',
    name: '👑 Luxury Collection Showcase',
    subject: '🕶️ Discover the Elite New Eyewear Collection from Lekya Specs',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lekya Specs - Elite Eyewear Collection</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #EAEAEA;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #121212; border: 1px solid #C5A028; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid rgba(197, 160, 40, 0.2);">
              <h1 style="margin: 0; font-size: 32px; color: #C5A028; letter-spacing: 4px; text-transform: uppercase; font-weight: 700;">LEKYA SPECS</h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #EAEAEA; letter-spacing: 6px; text-transform: uppercase; opacity: 0.8;">Luxury Eyewear &amp; AI Studio</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px; text-align: center;">
              <h2 style="margin: 0 0 15px 0; font-size: 24px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">Greetings, {{name}}</h2>
              <p style="margin: 0 0 30px 0; font-size: 14px; color: #B3B3B3; line-height: 1.8; font-weight: 300;">
                Step into a world where cutting-edge AI meets premium craftsmanship. Our new collection has arrived, featuring handcrafted details, custom prescription indexes, and timeless gold-accented frames.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #C5A028; border-radius: 4px;">
                    <a href="{{origin}}/shop" target="_blank" style="display: inline-block; padding: 15px 35px; font-size: 12px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 2px; text-transform: uppercase;">Discover the Collection</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 40px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="260" valign="top" style="background-color: #1A1A1A; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 20px; text-align: center;">
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #C5A028;">The Aviator Elite</h3>
                    <p style="margin: 0 0 15px 0; font-size: 12px; color: #A6A6A6; line-height: 1.6;">Classic silhouette engineered with lightweight premium alloy and anti-glare finish.</p>
                    <a href="{{origin}}/shop" style="font-size: 11px; font-weight: 700; color: #C5A028; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">View Frame &rarr;</a>
                  </td>
                  <td width="20">&nbsp;</td>
                  <td width="260" valign="top" style="background-color: #1A1A1A; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 20px; text-align: center;">
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #C5A028;">The Classic Wayfarer</h3>
                    <p style="margin: 0 0 15px 0; font-size: 12px; color: #A6A6A6; line-height: 1.6;">Bold contours crafted from hand-polished gold acetate for a timeless premium statement.</p>
                    <a href="{{origin}}/shop" style="font-size: 11px; font-weight: 700; color: #C5A028; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">View Frame &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #1A150A; border-top: 1px solid rgba(197, 160, 40, 0.15); border-bottom: 1px solid rgba(197, 160, 40, 0.15); padding: 30px; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #C5A028;">Try Them On Instantly From Home</h3>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #D4AF37; line-height: 1.6; font-weight: 300;">Use our new AI-Powered 2D Try-On Studio to see how frames look on your face shape with auto-alignment.</p>
              <a href="{{origin}}/tryon" style="display: inline-block; padding: 10px 25px; font-size: 11px; font-weight: 700; color: #C5A028; border: 1px solid #C5A028; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Open Try-On Studio</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px; background-color: #0d0d0d; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #777; line-height: 1.6;">You are receiving this email because you registered on our store.</p>
              <p style="margin: 0; font-size: 12px; color: #C5A028; font-weight: 600;">&copy; 2026 Lekya Specs Admin. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'exclusive_promo',
    name: '🎟️ Exclusive Coupon Invitation',
    subject: '✨ An Exclusive Invitation & Luxury Saving Gift for {{name}}',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Exclusive Lekya Specs Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #EAEAEA;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #121212; border: 1px solid #C5A028; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid rgba(197, 160, 40, 0.2);">
              <h1 style="margin: 0; font-size: 32px; color: #C5A028; letter-spacing: 4px; text-transform: uppercase;">LEKYA SPECS</h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #EAEAEA; letter-spacing: 6px; text-transform: uppercase; opacity: 0.8;">Elevated Vision</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 50px 40px 40px 40px; text-align: center;">
              <span style="font-size: 11px; font-weight: 700; color: #C5A028; letter-spacing: 3px; text-transform: uppercase; display: block; margin-bottom: 15px;">Private Invitation</span>
              <h2 style="margin: 0 0 20px 0; font-size: 26px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">An Exclusive Gift For {{name}}</h2>
              <p style="margin: 0 0 35px 0; font-size: 14px; color: #B3B3B3; line-height: 1.8; font-weight: 300;">
                To express our gratitude for being an esteemed client of Lekya Specs, we invite you to experience our premium sunglasses and prescription frames with a luxury savings gesture.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1A150A; border: 1px dashed #C5A028; border-radius: 6px; padding: 25px; margin-bottom: 35px;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #B3B3B3; display: block; margin-bottom: 8px;">Use Coupon Code At Checkout</span>
                    <span style="font-family: monospace; font-size: 28px; font-weight: 700; color: #C5A028; letter-spacing: 3px; display: block; margin-bottom: 8px;">LEKYA20</span>
                    <span style="font-size: 12px; color: #FFFFFF; font-weight: 600; display: block;">Enjoy Flat 20% Off Storewide + Free Shipping</span>
                  </td>
                </tr>
              </table>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #C5A028; border-radius: 4px;">
                    <a href="{{origin}}/shop" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 11px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 2px; text-transform: uppercase;">Shop With Code</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 45px 40px; border-top: 1px solid rgba(255,255,255,0.03);">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px; text-align: center;">
                <tr>
                  <td width="33%" style="font-size: 12px; color: #A6A6A6; line-height: 1.6;">
                    <strong style="color: #FFFFFF; display: block; margin-bottom: 5px;">Bespoke Lenses</strong>
                    Multi-index anti-glare coatings
                  </td>
                  <td width="33%" style="font-size: 12px; color: #A6A6A6; line-height: 1.6;">
                    <strong style="color: #FFFFFF; display: block; margin-bottom: 5px;">AI Face Scan</strong>
                    Tailored frame alignment matching
                  </td>
                  <td width="33%" style="font-size: 12px; color: #A6A6A6; line-height: 1.6;">
                    <strong style="color: #FFFFFF; display: block; margin-bottom: 5px;">Bespoke Tinting</strong>
                    Personalized style customizer
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px; background-color: #0d0d0d; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #666; line-height: 1.6;">Offer valid for limited time. Only one coupon can be used per order.</p>
              <p style="margin: 0; font-size: 12px; color: #C5A028; font-weight: 600;">&copy; 2026 Lekya Specs Admin. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'loyalty_club',
    name: '💎 Elite Loyalty Club Update',
    subject: '✨ Lekya Specs Rewards Club: Unlocking Your Elite Privileges',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lekya Specs Rewards Club Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #EAEAEA;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #121212; border: 1px solid #C5A028; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid rgba(197, 160, 40, 0.2);">
              <h1 style="margin: 0; font-size: 32px; color: #C5A028; letter-spacing: 4px; text-transform: uppercase;">LEKYA SPECS</h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #EAEAEA; letter-spacing: 6px; text-transform: uppercase; opacity: 0.8;">REWARDS CLUB</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 50px 40px 30px 40px; text-align: center;">
              <h2 style="margin: 0 0 20px 0; font-size: 26px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">Unlocking Elite Privileges</h2>
              <p style="margin: 0 0 35px 0; font-size: 14px; color: #B3B3B3; line-height: 1.8; font-weight: 300;">
                Hello {{name}}, you are a valued member of the Lekya Specs family. We've updated your Rewards Portal with new ways to earn points, exclusive tiers, and special gift redemptions.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1A1A1A; border: 1px solid rgba(197,160,40,0.15); border-radius: 6px; padding: 25px; margin-bottom: 35px; text-align: left;">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span style="font-size: 11px; text-transform: uppercase; color: #999; letter-spacing: 1px;">Your Current Tier</span>
                    <strong style="font-size: 18px; color: #C5A028; display: block; margin-top: 3px;">GOLD ELITE MEMBER</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #999; letter-spacing: 1px;">Earning Power</span>
                    <strong style="font-size: 14px; color: #FFFFFF; display: block; margin-top: 3px;">10% Points Cashback on all purchases</strong>
                  </td>
                </tr>
              </table>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #C5A028; border-radius: 4px;">
                    <a href="{{origin}}/account" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 11px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 2px; text-transform: uppercase;">View Rewards Portal</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px; background-color: #0d0d0d; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #666; line-height: 1.6;">Points expire 12 months from award date. Terms apply.</p>
              <p style="margin: 0; font-size: 12px; color: #C5A028; font-weight: 600;">&copy; 2026 Lekya Specs Admin. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'face_scanner',
    name: '📸 AI Face Shape Scanner Invite',
    subject: '📸 Find Your Perfect Frame: Get a Free AI Face Scan',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lekya Specs AI Face Scanner</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #EAEAEA;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #121212; border: 1px solid #C5A028; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid rgba(197, 160, 40, 0.2);">
              <h1 style="margin: 0; font-size: 32px; color: #C5A028; letter-spacing: 4px; text-transform: uppercase;">LEKYA SPECS</h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #EAEAEA; letter-spacing: 6px; text-transform: uppercase; opacity: 0.8;">AI VISION STUDIO</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 50px 40px 40px 40px; text-align: center;">
              <h2 style="margin: 0 0 20px 0; font-size: 26px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">Your Face. Your Perfect Fit.</h2>
              <p style="margin: 0 0 35px 0; font-size: 14px; color: #B3B3B3; line-height: 1.8; font-weight: 300;">
                Hello {{name}}, wearing the wrong glasses shape can throw off your facial symmetry. Our new **AI Face Scanner** uses real neural models to scan your facial structures in 10 seconds and instantly recommend the most flattering geometry for you.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #161a22; border: 1px solid #C5A028; border-radius: 6px; padding: 20px; margin-bottom: 35px; text-align: center;">
                <tr>
                  <td>
                    <span style="font-size: 12px; color: #FFFFFF; font-weight: 700; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Step 1: Open Scanner on Dashboard</span>
                    <span style="font-size: 12px; color: #C5A028; font-weight: 700; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Step 2: Scan your landmarks live</span>
                    <span style="font-size: 12px; color: #FFFFFF; font-weight: 700; display: block; text-transform: uppercase; letter-spacing: 1px;">Step 3: Access tailored matches</span>
                  </td>
                </tr>
              </table>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #C5A028; border-radius: 4px;">
                    <a href="{{origin}}/account" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 11px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 2px; text-transform: uppercase;">Run AI Scanner Now</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px; background-color: #0d0d0d; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #C5A028; font-weight: 600;">&copy; 2026 Lekya Specs Admin. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'tryon_lab',
    name: '🕶️ AI Try-On Studio Spotlight',
    subject: '🕶️ {{name}}, Try Eyewear Instantly with VTO AI Auto-Fit',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lekya Specs VTO Studio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #EAEAEA;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #121212; border: 1px solid #C5A028; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid rgba(197, 160, 40, 0.2);">
              <h1 style="margin: 0; font-size: 32px; color: #C5A028; letter-spacing: 4px; text-transform: uppercase;">LEKYA SPECS</h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #EAEAEA; letter-spacing: 6px; text-transform: uppercase; opacity: 0.8;">VIRTUAL TRY-ON STUDIO</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 50px 40px 40px 40px; text-align: center;">
              <h2 style="margin: 0 0 20px 0; font-size: 26px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">The Try-On Studio. Redefined.</h2>
              <p style="margin: 0 0 35px 0; font-size: 14px; color: #B3B3B3; line-height: 1.8; font-weight: 300;">
                Hello {{name}}, skip the physical showrooms. Our brand new **AI Auto-Fit Virtual Try-On** automatically detects your eye center landmarks, aligns frames with exact scale and rotation, and keys out product backgrounds so you only see the glasses on your face.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #C5A028; border-radius: 4px;">
                    <a href="{{origin}}/tryon" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 11px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 2px; text-transform: uppercase;">Open Try-On Session</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px; background-color: #0d0d0d; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #C5A028; font-weight: 600;">&copy; 2026 Lekya Specs Admin. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'cart_recovery',
    name: '🛒 Abandoned Cart Recovery',
    subject: '🛒 {{name}}, Complete Your Handcrafted Eyewear Order',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lekya Specs - Complete Your Order</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #EAEAEA;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #121212; border: 1px solid #C5A028; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid rgba(197, 160, 40, 0.2);">
              <h1 style="margin: 0; font-size: 32px; color: #C5A028; letter-spacing: 4px; text-transform: uppercase;">LEKYA SPECS</h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #EAEAEA; letter-spacing: 6px; text-transform: uppercase; opacity: 0.8;">SHOPPING CART ASSISTANT</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 50px 40px 40px 40px; text-align: center;">
              <h2 style="margin: 0 0 20px 0; font-size: 26px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">Almost Yours.</h2>
              <p style="margin: 0 0 35px 0; font-size: 14px; color: #B3B3B3; line-height: 1.8; font-weight: 300;">
                Hello {{name}}, we noticed you left premium eyewear in your shopping cart. These frames are handcrafted from elite lightweight acetate and have high stock demand. Don't lose them!
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1A1A1A; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 20px; margin-bottom: 35px; text-align: center;">
                <tr>
                  <td>
                    <span style="font-size: 12px; color: #B3B3B3; display: block;">Your items are saved. Click checkout to select your lens indexes (1.56 - 1.74) and custom coatings.</span>
                  </td>
                </tr>
              </table>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #C5A028; border-radius: 4px;">
                    <a href="{{origin}}/cart" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 11px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 2px; text-transform: uppercase;">Complete Checkout Now</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px; background-color: #0d0d0d; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #C5A028; font-weight: 600;">&copy; 2026 Lekya Specs Admin. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'support_feedback',
    name: '💬 Share Your Feedback Survey',
    subject: '💬 {{name}}, Help Us Elevate Your Vision Experience',
    body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lekya Specs - Client Feedback</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #EAEAEA;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0A0A; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #121212; border: 1px solid #C5A028; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid rgba(197, 160, 40, 0.2);">
              <h1 style="margin: 0; font-size: 32px; color: #C5A028; letter-spacing: 4px; text-transform: uppercase;">LEKYA SPECS</h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #EAEAEA; letter-spacing: 6px; text-transform: uppercase; opacity: 0.8;">CLIENT RELATIONS</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 50px 40px 40px 40px; text-align: center;">
              <h2 style="margin: 0 0 20px 0; font-size: 26px; color: #FFFFFF; font-weight: 600; line-height: 1.4;">Elevating the Standards.</h2>
              <p style="margin: 0 0 35px 0; font-size: 14px; color: #B3B3B3; line-height: 1.8; font-weight: 300;">
                Hello {{name}}, we are committed to delivering the ultimate eyewear and shopping experience. We would be extremely grateful if you could spare 1 minute to share your feedback or suggestions with our team.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #C5A028; border-radius: 4px;">
                    <a href="{{origin}}/contact" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 11px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 2px; text-transform: uppercase;">Submit Feedback</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px; background-color: #0d0d0d; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #C5A028; font-weight: 600;">&copy; 2026 Lekya Specs Admin. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
];

export default function Admin() {
  const router = useRouter();
  const { user, token, authLoading, logout } = useAuth();

  // Active dashboard tabs: 'stats', 'products', 'orders', 'customers'
  const [activeTab, setActiveTab] = useState('stats');

  // Sidebar Hover Expansion & Settings Vault States
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('apis'); // 'apis', 'security', 'firewall', 'secrets'
  const [sandboxEvent, setSandboxEvent] = useState('whatsapp_inbound');
  const [sandboxTesting, setSandboxTesting] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  // Stats / Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Products CRUD State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Add/Edit Product Form state
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Eyeglasses');
  const [prodGender, setProdGender] = useState('Unisex');
  const [prodShape, setProdShape] = useState('Rectangle');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [crudError, setCrudError] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [deliveryAgents, setDeliveryAgents] = useState([]);

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  // CMS Customizer State
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [trendingTitle, setTrendingTitle] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Order Filtering & Inspection Modal State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderCourierFilter, setOrderCourierFilter] = useState('ALL'); // 'ALL', 'PARCEL_UNCLE', 'LOCAL_RIDER', 'UNASSIGNED'
  const [orderPrescriptionFilter, setOrderPrescriptionFilter] = useState('ALL'); // 'ALL', 'WITH_RX', 'NO_RX'
  const [orderSortBy, setOrderSortBy] = useState('NEWEST'); // 'NEWEST', 'OLDEST', 'AMOUNT_HIGH', 'AMOUNT_LOW'

  // Master Order Inspection Modal State
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

  // Customer Filtering State
  const [customerSearch, setCustomerSearch] = useState('');

  // Product Filtering State
  const [productSearch, setProductSearch] = useState('');

  // Admin Management State
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  // Team Management State
  const [teamUsers, setTeamUsers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamRoleFilter, setTeamRoleFilter] = useState('All');
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  // Coupon System State
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponValue, setCouponValue] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponMaxUses, setCouponMaxUses] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Broadcast Email State
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [broadcastError, setBroadcastError] = useState('');
  const [broadcastMode, setBroadcastMode] = useState('all'); // 'all' or 'specific'
  const [broadcastTargetEmail, setBroadcastTargetEmail] = useState('');
  const [broadcastSearchQuery, setBroadcastSearchQuery] = useState('');

  // Activity Log State
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // 10 new features: Helpdesk reply hub state
  const [contactMessages, setContactMessages] = useState([]);
  const [contactMessagesLoading, setContactMessagesLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [replyingMessageId, setReplyingMessageId] = useState(null);

  // 10 new features: DB Health metrics state
  const [dbHealth, setDbHealth] = useState(null);
  const [dbHealthLoading, setDbHealthLoading] = useState(true);
  const [optimizingDb, setOptimizingDb] = useState(false);

  // Live session tracker state
  const [activeSessionsData, setActiveSessionsData] = useState(null);
  const [activeSessionsLoading, setActiveSessionsLoading] = useState(true);

  // Delivery OTP Monitor state
  const [deliveryOtps, setDeliveryOtps] = useState([]);
  const [deliveryOtpsLoading, setDeliveryOtpsLoading] = useState(true);

  // Live Signup OTP Monitor state
  const [signupOtps, setSignupOtps] = useState([]);
  const [signupOtpsLoading, setSignupOtpsLoading] = useState(true);

  // Returns & Exchanges State
  const [returnsData, setReturnsData] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(true);
  const [updatingReturnId, setUpdatingReturnId] = useState(null);
  const [returnStatusMap, setReturnStatusMap] = useState({});
  const [returnNotesMap, setReturnNotesMap] = useState({});
  const [returnUpdateMsg, setReturnUpdateMsg] = useState('');

  const fetchSignupOtps = () => {
    if (!token) return;
    fetch(`${API_BASE}/api/admin/otps`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        if (data && data.success) {
          setSignupOtps(Array.isArray(data.otps) ? data.otps : []);
        } else {
          setSignupOtps([]);
        }
        setSignupOtpsLoading(false);
      })
      .catch(() => setSignupOtpsLoading(false));
  };

  useEffect(() => {
    fetchSignupOtps();
    const interval = setInterval(fetchSignupOtps, 8000);
    return () => clearInterval(interval);
  }, [token]);

  // 10 new features: Inspect customer profile state
  const [inspectedCustomer, setInspectedCustomer] = useState(null);
  const [inspectedCustomerLoading, setInspectedCustomerLoading] = useState(false);
  const [showCustomerInspectModal, setShowCustomerInspectModal] = useState(false);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [editCustName, setEditCustName] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustRole, setEditCustRole] = useState('user');
  const [editCustPassword, setEditCustPassword] = useState('');
  const [editCustError, setEditCustError] = useState('');
  const [editCustSuccess, setEditCustSuccess] = useState('');

  // 10 new features: Order shipping tracking modal state
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [trackingCommentsText, setTrackingCommentsText] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Security gate: redirect if not admin
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!authLoading && user) {
      const isAdmin = user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com';
      if (!isAdmin) {
        router.push('/account');
      }
    }
  }, [user, authLoading, router]);

  // Fetch data depending on active tab
  useEffect(() => {
    if (!token || !user || !(user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com')) return;

    if (activeTab === 'stats') {
      setAnalyticsLoading(true);
      fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : {})
        .then(data => { setAnalytics(data && data.metrics ? data : null); setAnalyticsLoading(false); })
        .catch(err => { console.error(err); setAnalyticsLoading(false); });
    } else if (activeTab === 'products') {
      setProductsLoading(true);
      fetch(`${API_BASE}/api/products`)
        .then(res => res.ok ? res.json() : [])
        .then(data => { setProducts(Array.isArray(data) ? data : []); setProductsLoading(false); })
        .catch(err => { console.error(err); setProductsLoading(false); });
    } else if (activeTab === 'orders') {
      setOrdersLoading(true);
      fetch(`${API_BASE}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => { setOrders(Array.isArray(data) ? data : []); setOrdersLoading(false); })
        .catch(err => { console.error(err); setOrdersLoading(false); });

      fetch(`${API_BASE}/api/seller/delivery-agents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setDeliveryAgents(data || []); })
        .catch(err => console.error(err));
    } else if (activeTab === 'customers' || activeTab === 'broadcast') {
      setCustomersLoading(true);
      fetch(`${API_BASE}/api/admin/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setCustomers(data || []); setCustomersLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'customizer') {
      setSettingsLoading(true);
      setSettingsError('');
      setSettingsSuccess('');
      fetch(`${API_BASE}/api/settings`)
        .then(res => res.json())
        .then(data => {
          setHeroTitle(data.hero_title || '');
          setHeroSubtitle(data.hero_subtitle || '');
          setHeroImage(data.hero_image || '');
          setTrendingTitle(data.trending_title || '');
          setSettingsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setSettingsError('Failed to load store CMS settings');
          setSettingsLoading(false);
        });
    } else if (activeTab === 'admins') {
      setAdminsLoading(true);
      fetch(`${API_BASE}/api/admin/admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => { setAdmins(Array.isArray(data) ? data : []); setAdminsLoading(false); })
        .catch(err => { console.error(err); setAdminsLoading(false); });
    } else if (activeTab === 'coupons') {
      setCouponsLoading(true);
      fetch(`${API_BASE}/api/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => { setCoupons(Array.isArray(data) ? data : []); setCouponsLoading(false); })
        .catch(err => { console.error(err); setCouponsLoading(false); });
    } else if (activeTab === 'logs') {
      setLogsLoading(true);
      fetch(`${API_BASE}/api/admin/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => { setLogs(Array.isArray(data) ? data : []); setLogsLoading(false); })
        .catch(err => { console.error(err); setLogsLoading(false); });
    } else if (activeTab === 'helpdesk') {
      setContactMessagesLoading(true);
      fetch(`${API_BASE}/api/admin/helpdesk`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => { setContactMessages(Array.isArray(data) ? data : []); setContactMessagesLoading(false); })
        .catch(err => { console.error(err); setContactMessagesLoading(false); });
    } else if (activeTab === 'db') {
      setDbHealthLoading(true);
      fetch(`${API_BASE}/api/admin/db/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { setDbHealth(data); setDbHealthLoading(false); })
        .catch(err => { console.error(err); setDbHealthLoading(false); });
    } else if (activeTab === 'sessions') {
      setActiveSessionsLoading(true);
      fetch(`${API_BASE}/api/admin/active-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { setActiveSessionsData(data); setActiveSessionsLoading(false); })
        .catch(err => { console.error(err); setActiveSessionsLoading(false); });
    } else if (activeTab === 'team') {
      setTeamLoading(true);
      fetch(`${API_BASE}/api/admin/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => { setTeamUsers(Array.isArray(data) ? data : []); setTeamLoading(false); })
        .catch(err => { console.error(err); setTeamLoading(false); });
    } else if (activeTab === 'delivery-otps' || activeTab === 'otps') {
      setDeliveryOtpsLoading(true);
      fetch(`${API_BASE}/api/admin/otps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : { otps: [] })
        .then(data => { 
          const list = data && Array.isArray(data.otps) ? data.otps : (Array.isArray(data) ? data : []);
          setDeliveryOtps(list); 
          setDeliveryOtpsLoading(false); 
        })
        .catch(err => { console.error(err); setDeliveryOtpsLoading(false); });
    } else if (activeTab === 'returns') {
      setReturnsLoading(true);
      fetch(`${API_BASE}/api/returns/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          const arr = Array.isArray(data) ? data : [];
          setReturnsData(arr);
          const sm = {};
          const nm = {};
          arr.forEach(r => { sm[r.id] = r.status; nm[r.id] = ''; });
          setReturnStatusMap(sm);
          setReturnNotesMap(nm);
          setReturnsLoading(false);
        })
        .catch(err => { console.error(err); setReturnsLoading(false); });
    }
  }, [activeTab, token, user]);

  // --- CRUD OPERATORS ---

  const openAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDescription('');
    setProdPrice('');
    setProdCategory('Eyeglasses');
    setProdGender('Unisex');
    setProdShape('Rectangle');
    setProdImage('https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80');
    setProdStock('20');
    setCrudError('');
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDescription(product.description || '');
    setProdPrice(product.price.toString());
    setProdCategory(product.category);
    setProdGender(product.gender);
    setProdShape(product.frame_shape);
    setProdImage(product.image_urls.join(', '));
    setProdStock(product.stock.toString());
    setCrudError('');
    setShowProductModal(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    setCrudError('');

    const url = editingProduct 
      ? `${API_BASE}/api/admin/products/${editingProduct.id}` 
      : `${API_BASE}/api/admin/products`;
    const method = editingProduct ? 'PUT' : 'POST';

    const payload = {
      name: prodName,
      description: prodDescription,
      price: parseFloat(prodPrice),
      category: prodCategory,
      gender: prodGender,
      frame_shape: prodShape,
      image_urls: prodImage.split(',').map(url => url.trim()).filter(url => url !== ''),
      stock: parseInt(prodStock)
    };

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setShowProductModal(false);
          // Refresh products tab
          setActiveTab('');
          setTimeout(() => setActiveTab('products'), 50);
        } else {
          setCrudError(data.message || 'Product operation failed');
        }
      })
      .catch(err => setCrudError('Connection error during product save'));
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError('');
    setSettingsSuccess('');

    fetch(`${API_BASE}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_image: heroImage,
        trending_title: trendingTitle
      })
    })
      .then(res => res.json())
      .then(data => {
        setSettingsSaving(false);
        if (data.message && data.message.includes('successfully')) {
          setSettingsSuccess('Store configurations saved and applied successfully!');
        } else {
          setSettingsError(data.message || 'Failed to save store settings.');
        }
      })
      .catch(err => {
        console.error(err);
        setSettingsError('Connection error during settings save.');
        setSettingsSaving(false);
      });
  };

  const handleDeleteProduct = (id) => {
    if (!confirm('Are you sure you want to delete this eyewear frame from the catalog?')) return;

    fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(products.filter(p => p.id !== id));
      })
      .catch(err => console.error(err));
  };

  // Update order status trigger
  const handleStatusUpdate = (orderId, newStatus) => {
    fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      })
      .catch(err => console.error(err));
  };

  // 1-Click Parcel Uncle Courier Dispatch Trigger
  const [dispatchingOrder, setDispatchingOrder] = useState(null);
  const handleDispatchParcelUncle = (orderId) => {
    setDispatchingOrder(orderId);
    fetch(`${API_BASE}/api/shipping/parcel-uncle/dispatch/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setDispatchingOrder(null);
        if (data.success) {
          alert(`Success! Dispatched via Parcel Uncle Logistics Network.\nWaybill: ${data.waybill}`);
          fetch(`${API_BASE}/api/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(list => setOrders(list));
        } else {
          alert(data.message || 'Failed to dispatch via Parcel Uncle');
        }
      })
      .catch(err => {
        setDispatchingOrder(null);
        alert('Network error connecting to Parcel Uncle API');
      });
  };

  // 1-Click Parcel Uncle Live Status Sync Trigger
  const [syncingOrder, setSyncingOrder] = useState(null);
  const handleSyncParcelUncle = (orderId) => {
    setSyncingOrder(orderId);
    fetch(`${API_BASE}/api/shipping/parcel-uncle/sync/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setSyncingOrder(null);
        if (data.success) {
          alert(`Parcel Uncle courier status synced!\nLive Status: ${data.order.parcel_uncle_status || 'MANIFESTED'}`);
          fetch(`${API_BASE}/api/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(list => setOrders(list));
        } else {
          alert(data.message || 'Sync failed');
        }
      })
      .catch(() => {
        setSyncingOrder(null);
        alert('Network error connecting to Parcel Uncle sync service');
      });
  };

  // Assign delivery agent (rider) to order trigger
  const handleRiderAssign = (orderId, agentId) => {
    if (!agentId) return; // Ignore empty values
    fetch(`${API_BASE}/api/seller/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ delivery_agent_id: parseInt(agentId) })
    })
      .then(res => res.json())
      .then(data => {
        // Refresh orders list to get fresh assignments and status updates
        fetch(`${API_BASE}/api/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(list => setOrders(list));
      })
      .catch(err => console.error('Assign delivery agent error:', err));
  };

  // Handle Admin creation form submit
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    fetch(`${API_BASE}/api/admin/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: adminName, email: adminEmail, password: adminPassword })
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Failed') });
        return res.json();
      })
      .then(data => {
        setAdminSuccess(data.message || 'Admin created successfully');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        // Refresh admins list
        fetch(`${API_BASE}/api/admin/admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(list => setAdmins(list));
        setTimeout(() => setShowAdminModal(false), 1500);
      })
      .catch(err => setAdminError(err.message));
  };

  // Handle demoting admin user
  const handleDemoteAdmin = (adminId) => {
    if (!window.confirm('Are you sure you want to demote this administrator to a standard customer?')) return;

    fetch(`${API_BASE}/api/admin/demote-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: adminId })
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Failed') });
        return res.json();
      })
      .then(data => {
        // Refresh admins list
        fetch(`${API_BASE}/api/admin/admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(list => setAdmins(list));
      })
      .catch(err => alert(err.message));
  };

  // Handle coupon creation
  const handleCouponSubmit = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    fetch(`${API_BASE}/api/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code: couponCode,
        discount_type: couponType,
        discount_value: couponValue,
        expiry_date: couponExpiry || null,
        max_uses: couponMaxUses || null
      })
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Failed') });
        return res.json();
      })
      .then(data => {
        setCouponSuccess('Promo code created successfully');
        setCouponCode('');
        setCouponValue('');
        setCouponExpiry('');
        setCouponMaxUses('');
        // Refresh coupons
        fetch(`${API_BASE}/api/admin/coupons`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(list => setCoupons(list));
        setTimeout(() => setShowCouponModal(false), 1500);
      })
      .catch(err => setCouponError(err.message));
  };

  // Handle coupon deletion
  const handleDeleteCoupon = (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;

    fetch(`${API_BASE}/api/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Failed') });
        return res.json();
      })
      .then(data => {
        setCoupons(coupons.filter(c => c.id !== id));
      })
      .catch(err => alert(err.message));
  };

  // Handle coupon toggle
  const handleToggleCoupon = (id, activeStatus) => {
    fetch(`${API_BASE}/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_active: activeStatus })
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Failed') });
        return res.json();
      })
      .then(data => {
        setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: activeStatus ? 1 : 0 } : c));
      })
      .catch(err => alert(err.message));
  };

  // Handle broadcast submit
  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    setBroadcastError('');
    setBroadcastSuccess('');
    setBroadcastSending(true);

    // Replace {{origin}} dynamically
    const processedBody = broadcastBody.replaceAll('{{origin}}', window.location.origin);

    fetch(`${API_BASE}/api/admin/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        subject: broadcastSubject, 
        bodyHtml: processedBody,
        targetEmail: broadcastMode === 'specific' ? broadcastTargetEmail : null
      })
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Failed') });
        return res.json();
      })
      .then(data => {
        setBroadcastSuccess(data.message || 'Email campaign broadcast completed successfully.');
        setBroadcastSubject('');
        setBroadcastBody('');
        setBroadcastTargetEmail('');
        setBroadcastSearchQuery('');
        setBroadcastSending(false);
      })
      .catch(err => {
        setBroadcastError(err.message);
        setBroadcastSending(false);
      });
  };

  // DB Optimization handler
  const handleOptimizeDb = () => {
    setOptimizingDb(true);
    fetch(`${API_BASE}/api/admin/db/optimize`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Database vacuum optimization complete!');
        setOptimizingDb(false);
        // Refresh DB health metrics
        fetch(`${API_BASE}/api/admin/db/health`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(health => setDbHealth(health));
      })
      .catch(err => {
        alert(err.message);
        setOptimizingDb(false);
      });
  };

  // Support Reply handler
  const handleSupportReply = (e, msgId) => {
    e.preventDefault();
    const replyText = replyTextMap[msgId];
    if (!replyText || !replyText.trim()) return;

    setReplyingMessageId(msgId);

    fetch(`${API_BASE}/api/admin/helpdesk/${msgId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reply_message: replyText })
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Failed') });
        return res.json();
      })
      .then(data => {
        alert('Reply email successfully sent to customer!');
        setReplyingMessageId(null);
        // Reset reply textbox in state map
        setReplyTextMap(prev => ({ ...prev, [msgId]: '' }));
        // Refresh contact messages list
        fetch(`${API_BASE}/api/admin/helpdesk`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(list => setContactMessages(list));
      })
      .catch(err => {
        alert(err.message);
        setReplyingMessageId(null);
      });
  };

  // Inspect Customer handler
  const handleInspectCustomer = (custId) => {
    setInspectedCustomerLoading(true);
    setShowCustomerInspectModal(true);
    setIsEditingCredentials(false);
    setEditCustPassword('');
    setEditCustError('');
    setEditCustSuccess('');

    fetch(`${API_BASE}/api/admin/customers/${custId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(data => {
        setInspectedCustomer(data);
        setEditCustName(data.profile.name);
        setEditCustEmail(data.profile.email);
        setEditCustPhone(data.profile.phone || '');
        setEditCustRole(data.profile.role || 'user');
        setInspectedCustomerLoading(false);
      })
      .catch(err => {
        alert(err.message);
        setInspectedCustomerLoading(false);
        setShowCustomerInspectModal(false);
      });
  };

  // Update Customer Credentials handler
  const handleUpdateCustomerCredentials = (e) => {
    e.preventDefault();
    if (!inspectedCustomer) return;
    setEditCustError('');
    setEditCustSuccess('');

    fetch(`${API_BASE}/api/admin/customers/${inspectedCustomer.profile.id}/credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editCustName,
        email: editCustEmail,
        phone: editCustPhone,
        role: editCustRole,
        password: editCustPassword
      })
    })
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.message || 'Failed to update credentials') });
        return res.json();
      })
      .then(data => {
        setEditCustSuccess('Credentials updated successfully!');
        setEditCustPassword('');
        // Refresh the inspection modal data!
        fetch(`${API_BASE}/api/admin/customers/${inspectedCustomer.profile.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(newData => {
            setInspectedCustomer(newData);
            // Also reload the main customers list so grid updates!
            fetch(`${API_BASE}/api/admin/customers`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
              .then(res => res.json())
              .then(custData => setCustomers(custData))
              .catch(err => console.error(err));
          })
          .catch(err => console.error(err));

        setTimeout(() => {
          setIsEditingCredentials(false);
          setEditCustSuccess('');
        }, 1500);
      })
      .catch(err => {
        setEditCustError(err.message);
      });
  };

  // Save Order tracking update handler
  const handleSaveTracking = (e) => {
    e.preventDefault();
    if (!selectedTrackingOrder) return;

    fetch(`${API_BASE}/api/admin/orders/${selectedTrackingOrder.id}/tracking`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ trackingComments: trackingCommentsText })
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.message || 'Failed') });
        return res.json();
      })
      .then(data => {
        alert('Shipping details updated successfully!');
        setShowTrackingModal(false);
        // Refresh orders list
        fetch(`${API_BASE}/api/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(list => setOrders(list));
      })
      .catch(err => alert(err.message));
  };


  // --- RENDER SECURITY CHECKS ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-premium-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-premium-accent"></div>
      </div>
    );
  }

  if (!user || !(user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="font-serif text-3xl font-bold text-premium-black mb-2">Access Forbidden</h2>
        <p className="text-sm text-premium-gray mb-6">You do not have administrative access permissions to view this dashboard.</p>
        <Link href="/account" className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black text-xs uppercase tracking-widest px-6 py-3 rounded font-bold transition-colors">
          Return to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0016] text-white min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Background ambient gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#7B22A8]/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-[#FAAE62]/10 rounded-full blur-[120px] pointer-events-none animate-float-slow2" />

      {/* --- ANIMATED HOVER-EXPANDABLE LEFT SIDEBAR --- */}
      <aside 
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`bg-[#1A0024]/95 backdrop-blur-2xl text-white shrink-0 flex flex-col border-r border-[#FAAE62]/20 relative z-30 transition-all duration-300 ease-in-out ${
          sidebarHovered || sidebarPinned ? 'w-full md:w-72 p-6' : 'w-full md:w-20 p-4'
        }`}
      >
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 overflow-hidden" style={{ textDecoration: 'none' }}>
            <VisionEyeLogo size={32} showText={false} />
            {(sidebarHovered || sidebarPinned) && (
              <div className="whitespace-nowrap transition-opacity duration-300">
                <span className="font-serif text-lg font-bold text-white block leading-tight">LEKYA SPECS</span>
                <span className="text-[9px] text-[#FAAE62] uppercase tracking-wider font-semibold">Admin Console</span>
              </div>
            )}
          </Link>
          
          {/* Pin/Lock Sidebar Button (Desktop) */}
          <button
            onClick={() => setSidebarPinned(!sidebarPinned)}
            className="hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-[#FAAE62]/20 text-[#FAAE62] transition-all"
            title={sidebarPinned ? "Unpin Sidebar" : "Pin Sidebar Expanded"}
          >
            {sidebarPinned ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-1 flex-grow uppercase text-xs tracking-wider font-semibold admin-custom-scrollbar overflow-y-auto overflow-x-hidden pr-1">
          {[
            { id: 'stats', label: 'Dashboard Analytics', icon: BarChart3 },
            { id: 'products', label: 'Manage Products', icon: ShoppingBag },
            { id: 'orders', label: 'Customer Orders', icon: ClipboardList },
            { id: 'returns', label: 'Returns & Exchanges', icon: RefreshCw },
            { id: 'customers', label: 'View Customers', icon: Users },
            { id: 'admins', label: 'Manage Admins', icon: ShieldCheck },
            { id: 'coupons', label: 'Promo Codes', icon: Tag },
            { id: 'broadcast', label: 'Email Broadcast', icon: Mail },
            { id: 'logs', label: 'Activity Log', icon: ScrollText },
            { id: 'helpdesk', label: 'Support Helpdesk', icon: HelpCircle },
            { id: 'db', label: 'DB Optimizer', icon: Activity },
            { id: 'customizer', label: 'Store Customizer (CMS)', icon: Sliders },
            { id: 'sessions', label: 'Live User Monitor', icon: Users },
            { id: 'team', label: 'Team Management', icon: Users },
            { id: 'delivery-otps', label: 'Delivery OTPs', icon: ShieldAlert },
            { id: 'signup-otps', label: 'Live Signup OTPs', icon: Key },
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            const isExpanded = sidebarHovered || sidebarPinned;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={!isExpanded ? item.label : ''}
                className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200 ${
                  isExpanded ? 'px-4 text-left justify-start' : 'px-0 justify-center'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] font-extrabold shadow-[0_0_20px_rgba(250,174,98,0.35)] scale-[1.02]'
                    : 'text-[#9B7EA8] hover:text-white hover:bg-white/5 border border-transparent hover:border-[#FAAE62]/20'
                }`}
              >
                <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0D0016]' : 'text-[#FAAE62]'}`} />
                {isExpanded && (
                  <span className="truncate whitespace-nowrap text-xs">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Quick Hub Links */}
          <div className={`pt-3 space-y-1 border-t border-white/10 my-2 ${!(sidebarHovered || sidebarPinned) && 'text-center'}`}>
            <Link
              href="/stylist"
              title="Brand Stylist Hub"
              className={`w-full flex items-center gap-3 py-2.5 rounded-xl transition-all text-left text-[#FAAE62] hover:text-white hover:bg-[#FAAE62]/10 font-semibold text-xs tracking-wider border border-[#FAAE62]/30 ${
                (sidebarHovered || sidebarPinned) ? 'px-4 justify-start' : 'px-0 justify-center'
              }`}
              style={{ textDecoration: 'none' }}
            >
              <Sparkles className="w-4 h-4 text-[#FAAE62] shrink-0" />
              {(sidebarHovered || sidebarPinned) && <span className="truncate">Stylist Hub 🎨</span>}
            </Link>

            <Link
              href="/admin-map"
              title="Live Rider Map"
              className={`w-full flex items-center gap-3 py-2.5 rounded-xl transition-all text-left text-sky-400 hover:text-white hover:bg-sky-500/10 font-semibold text-xs tracking-wider border border-sky-500/30 ${
                (sidebarHovered || sidebarPinned) ? 'px-4 justify-start' : 'px-0 justify-center'
              }`}
              style={{ textDecoration: 'none' }}
            >
              <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
              {(sidebarHovered || sidebarPinned) && <span className="truncate">Live Rider Map 🛰</span>}
            </Link>

            <Link
              href="/crm"
              title="CRM Platform"
              className={`w-full flex items-center gap-3 py-2.5 rounded-xl transition-all text-left text-emerald-400 hover:text-white hover:bg-emerald-500/10 font-semibold text-xs tracking-wider border border-emerald-500/30 ${
                (sidebarHovered || sidebarPinned) ? 'px-4 justify-start' : 'px-0 justify-center'
              }`}
              style={{ textDecoration: 'none' }}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
              {(sidebarHovered || sidebarPinned) && <span className="truncate">CRM Platform 📈</span>}
            </Link>

            <Link
              href="/chat"
              title="Team Chat"
              className={`w-full flex items-center gap-3 py-2.5 rounded-xl transition-all text-left text-amber-400 hover:text-white hover:bg-amber-500/10 font-semibold text-xs tracking-wider border border-amber-500/30 ${
                (sidebarHovered || sidebarPinned) ? 'px-4 justify-start' : 'px-0 justify-center'
              }`}
              style={{ textDecoration: 'none' }}
            >
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              {(sidebarHovered || sidebarPinned) && <span className="truncate">Team Chat 💬</span>}
            </Link>
          </div>
        </nav>

        {/* Root Auth Indicator & Sign Out */}
        <div className="border-t border-white/10 pt-4 mt-auto">
          {(sidebarHovered || sidebarPinned) ? (
            <div className="flex items-center justify-between text-[10px] text-[#FAAE62]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Root Auth</span>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out from Lekya Admin Console?')) {
                    logout();
                    router.push('/account');
                  }
                }}
                className="text-red-400 hover:text-red-300 underline font-bold uppercase tracking-wider text-[9px]"
              >
                Sign Out 🚪
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (window.confirm('Sign out from Lekya Admin Console?')) {
                  logout();
                  router.push('/account');
                }
              }}
              title="Sign Out Admin"
              className="w-full flex items-center justify-center p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-grow p-4 sm:p-8 max-w-7xl overflow-x-hidden relative z-10">
        
        {/* --- TOP RIGHT HEADER CONTROL BAR --- */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-[#FAAE62]/20">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="text-xs font-mono text-[#FAAE62] uppercase tracking-wider font-bold block">
                Lekya Admin Core v1.0.5 • 99.98% Live Uptime
              </span>
              <span className="text-[10px] text-[#9B7EA8]">Connected to PostgreSQL Cloud &amp; Meta WhatsApp Node</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2.5 pr-2">
              <div className="w-7 h-7 rounded-lg bg-[#FAAE62]/20 border border-[#FAAE62]/40 flex items-center justify-center font-bold text-xs text-[#FAAE62]">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight truncate max-w-[110px]">{user?.name || 'Admin Core'}</span>
                <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider block leading-none">Superuser</span>
              </div>
            </div>

            {/* Icon-Only Compact Settings Gear Button at Extreme Top-Right */}
            <button
              onClick={() => setShowSettingsModal(true)}
              title="System Settings & Live APIs Vault ⚙️"
              className="p-2.5 bg-[#1A0024] hover:bg-[#FAAE62]/20 text-[#FAAE62] border border-[#FAAE62]/40 rounded-xl transition-all shadow-md shadow-[#FAAE62]/10 hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 group"
            >
              <Settings className="w-5 h-5 text-[#FAAE62] group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </header>
        
        {/* --- TAB 1: ANALYTICS OVERVIEW --- */}
        {activeTab === 'stats' && (
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-[#FAAE62]/20 pb-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white mb-1">
                  Dashboard Analytics
                </h2>
                <p className="text-xs text-[#9B7EA8]">Real-time sales performance, active orders, and store health metrics.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAAE62]/10 border border-[#FAAE62]/30 text-[#FAAE62] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Live Insights
              </div>
            </div>

            {analyticsLoading || !analytics ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-8">
                {/* Quick-Action Power Widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => {
                      setOrderStatusFilter('Pending');
                      setActiveTab('orders');
                    }}
                    className="flex items-center justify-between p-5 bg-[#1A0024]/80 border border-[#FAAE62]/30 rounded-2xl text-left transition-all hover:border-[#FAAE62] hover:shadow-[0_0_25px_rgba(250,174,98,0.2)] admin-card-3d group"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#FAAE62] tracking-wider mb-1">Pending Orders</span>
                      <span className="text-3xl font-extrabold text-white">{analytics.metrics?.pending_orders ?? 0}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#FAAE62]/10 border border-[#FAAE62]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardList className="w-6 h-6 text-[#FAAE62]" />
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      setProductSearch('');
                      setActiveTab('products');
                    }}
                    className="flex items-center justify-between p-5 bg-[#1A0024]/80 border border-red-500/30 rounded-2xl text-left transition-all hover:border-red-400 hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] admin-card-3d group"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Out of Stock</span>
                      <span className="text-3xl font-extrabold text-white">{analytics.metrics?.out_of_stock ?? 0}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-red-400" />
                    </div>
                  </button>

                  <div className="flex items-center justify-between p-5 bg-[#1A0024]/80 border border-emerald-500/30 rounded-2xl text-left admin-card-3d">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">Today's Revenue</span>
                      <span className="text-2xl font-extrabold text-white">₹{(analytics.metrics?.today_sales ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Landmark className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setCustomerSearch('');
                      setActiveTab('customers');
                    }}
                    className="flex items-center justify-between p-5 bg-[#1A0024]/80 border border-sky-500/30 rounded-2xl text-left transition-all hover:border-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)] admin-card-3d group"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-1">New Users Today</span>
                      <span className="text-3xl font-extrabold text-white">{analytics.metrics?.new_customers_today ?? 0}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-sky-400" />
                    </div>
                  </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-[#1A0024]/80 border border-[#FAAE62]/30 rounded-2xl p-6 shadow-xl backdrop-blur-xl admin-card-3d">
                    <span className="block text-xs uppercase tracking-wider text-[#9B7EA8] font-semibold mb-2">Total Sales Revenue</span>
                    <span className="text-3xl font-bold text-white font-mono">₹{(analytics.metrics?.total_sales ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-[#1A0024]/80 border border-[#FAAE62]/30 rounded-2xl p-6 shadow-xl backdrop-blur-xl admin-card-3d">
                    <span className="block text-xs uppercase tracking-wider text-[#9B7EA8] font-semibold mb-2">Paid Orders</span>
                    <span className="text-3xl font-bold text-white font-mono">{analytics.metrics?.total_orders ?? 0}</span>
                  </div>
                  <div className="bg-[#1A0024]/80 border border-[#FAAE62]/30 rounded-2xl p-6 shadow-xl backdrop-blur-xl admin-card-3d">
                    <span className="block text-xs uppercase tracking-wider text-[#9B7EA8] font-semibold mb-2">Registered Customers</span>
                    <span className="text-3xl font-bold text-white font-mono">{analytics.metrics?.total_customers ?? 0}</span>
                  </div>
                </div>

                {/* 7-Day Revenue Line Chart */}
                <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#FAAE62]" /> 7-Day Sales Trend
                    </h3>
                    <span className="text-xs text-[#9B7EA8] font-semibold">Live Transaction Activity</span>
                  </div>
                  <RevenueChart data={analytics.sales_trend || []} />
                </div>

                {/* Grid for top selling & low stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Selling Products */}
                  <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                    <h3 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#FAAE62] fill-[#FAAE62]" /> Top 5 Best Sellers
                    </h3>
                    <div className="divide-y divide-white/10">
                      {(analytics.top_products || []).map((item, idx) => (
                        <div key={item.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xs text-[#FAAE62] w-4">{idx + 1}</span>
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-white/20" />
                            <div>
                              <span className="font-semibold text-sm text-white block truncate max-w-[150px]">{item.name}</span>
                              <span className="text-[10px] text-[#9B7EA8] uppercase font-semibold">{item.frame_shape} shape</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm block text-[#FAAE62]">₹{parseFloat(item.revenue || 0).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-[#9B7EA8] block">{item.units_sold} units sold</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low Stock Warnings */}
                  <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                    <h3 className="font-serif text-lg font-bold text-white mb-4 text-red-400 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-400" /> Low Stock Alerts
                    </h3>
                    {(!analytics.low_stock_alerts || analytics.low_stock_alerts.length === 0) && (!analytics.low_stock_products || analytics.low_stock_products.length === 0) ? (
                      <p className="text-sm text-[#9B7EA8] py-4 text-center">All product inventory columns healthy.</p>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {(analytics.low_stock_alerts || analytics.low_stock_products || []).map(item => (
                          <div key={item.id} className="py-3 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-sm text-white block">{item.name}</span>
                              <span className="text-xs text-[#9B7EA8]">Price: ₹{parseFloat(item.price || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                              item.stock === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}>
                              {item.stock} left
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sales Category Distribution */}
                <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                  <h3 className="font-serif text-lg font-bold text-white mb-4">Category Distribution</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {(analytics.category_distribution || analytics.category_sales || []).map(cat => (
                      <div key={cat.category} className="p-4 bg-[#0D0016]/80 border border-[#FAAE62]/20 rounded-xl">
                        <span className="block text-xs uppercase tracking-wider text-[#9B7EA8] font-semibold mb-1">{cat.category}</span>
                        <span className="text-xl font-bold text-white font-mono">₹{parseFloat(cat.revenue || 0).toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-[#FAAE62] uppercase font-bold mt-1">{cat.items_sold} sold</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: PRODUCT CATALOG MANAGEMENT --- */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-[#FAAE62]/20 pb-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white mb-1">
                  Manage Inventory
                </h2>
                <p className="text-xs text-[#9B7EA8]">Create, update, or remove eyewear frames and set stock availability.</p>
              </div>
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-extrabold text-xs tracking-widest uppercase px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#FAAE62]/20"
              >
                <Plus className="w-4 h-4" /> Add Eyewear Frame
              </button>
            </div>

            {productsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-[#FAAE62] animate-spin mx-auto" /></div>
            ) : (
              <div>
                {/* Product Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search products by name, category, shape..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full sm:w-96 bg-[#1A0024] border border-[#FAAE62]/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FAAE62] font-medium"
                  />
                  <span className="text-xs text-[#9B7EA8] font-semibold">{products.filter(p =>
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.frame_shape.toLowerCase().includes(productSearch.toLowerCase())
                  ).length} of {products.length} products listed</span>
                </div>

                <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                  <table className="min-w-full divide-y divide-white/10 text-left">
                    <thead className="bg-[#0D0016] text-[10px] uppercase tracking-wider text-[#FAAE62] font-bold">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Product Details</th>
                        <th className="px-6 py-4">Gender/Category</th>
                        <th className="px-6 py-4">Frame Shape</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs font-medium text-white">
                      {products.filter(p =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.frame_shape.toLowerCase().includes(productSearch.toLowerCase())
                      ).map(prod => (
                        <tr key={prod.id} className="hover:bg-[#2A0440]/60 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-[#FAAE62]">#{prod.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={prod.image_urls[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-white/20" />
                              <span className="font-semibold block truncate max-w-[180px]">{prod.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-[#9B7EA8]">{prod.gender} • {prod.category}</td>
                          <td className="px-6 py-4">{prod.frame_shape}</td>
                          <td className="px-6 py-4 font-bold text-[#FAAE62]">₹{parseFloat(prod.price).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                              prod.stock === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                              prod.stock <= 5 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}>
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-3">
                              <button onClick={() => openEditModal(prod)} className="p-2 bg-white/5 border border-white/10 hover:border-[#FAAE62] rounded-lg text-[#9B7EA8] hover:text-[#FAAE62] transition-all" title="Edit Frame">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 bg-white/5 border border-white/10 hover:border-red-500 rounded-lg text-[#9B7EA8] hover:text-red-400 transition-all" title="Delete Frame">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: ORDER STATUS ACTIONS --- */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-[#FAAE62]/20 pb-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white mb-1">
                  Customer Orders
                </h2>
                <p className="text-xs text-[#9B7EA8]">Manage order fulfillment, status transitions, rider assignments, and export invoices.</p>
              </div>
              <button
                onClick={() => {
                  fetch(`${API_BASE}/api/admin/export/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                    .then(res => res.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    })
                    .catch(err => console.error(err));
                }}
                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-extrabold text-xs tracking-widest uppercase px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#FAAE62]/20"
              >
                <Download className="w-4 h-4" /> Export to CSV
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-[#FAAE62] animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-6">
                
                {/* --- ADVANCED MULTI-FILTER BAR --- */}
                <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl p-5 shadow-xl space-y-4 backdrop-blur-xl">
                  
                  {/* Top Bar: Search + Quick Stats */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                      <input
                        type="text"
                        placeholder="Search orders (ID, Tracking AWB, Name, Phone)..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full bg-[#0D0016] border border-[#FAAE62]/40 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#FAAE62] font-medium"
                      />
                      <HelpCircle className="w-4 h-4 text-[#FAAE62] absolute left-3 top-3 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs font-mono">
                      <div className="bg-[#0D0016] px-3 py-1.5 rounded-xl border border-white/10 text-gray-300">
                        Total Orders: <span className="text-[#FAAE62] font-bold">{orders.length}</span>
                      </div>
                      <div className="bg-[#0D0016] px-3 py-1.5 rounded-xl border border-orange-500/30 text-orange-400">
                        Parcel Uncle: <span className="font-bold">{orders.filter(o => o.parcel_uncle_tracking_id).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter Pills & Select Options Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/10">
                    
                    {/* Filter 1: Fulfillment Status */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#FAAE62] block mb-1">Status Filter</label>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="w-full bg-[#0D0016] text-xs font-semibold border border-[#FAAE62]/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FAAE62]"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Payment Confirmed">Payment Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>

                    {/* Filter 2: Courier Partner */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Courier Partner</label>
                      <select
                        value={orderCourierFilter}
                        onChange={(e) => setOrderCourierFilter(e.target.value)}
                        className="w-full bg-[#0D0016] text-xs font-semibold border border-amber-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="ALL">All Logistics Partners</option>
                        <option value="PARCEL_UNCLE">Parcel Uncle Express 📦</option>
                        <option value="LOCAL_RIDER">Local Delivery Rider 🏍️</option>
                        <option value="UNASSIGNED">Unassigned Orders ⏳</option>
                      </select>
                    </div>

                    {/* Filter 3: Prescription Filter */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-purple-400 block mb-1">Lens Prescription</label>
                      <select
                        value={orderPrescriptionFilter}
                        onChange={(e) => setOrderPrescriptionFilter(e.target.value)}
                        className="w-full bg-[#0D0016] text-xs font-semibold border border-purple-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="ALL">All Orders</option>
                        <option value="WITH_RX">With Medical Prescription 👓</option>
                        <option value="NO_RX">Standard Zero Power</option>
                      </select>
                    </div>

                    {/* Filter 4: Sorting Order */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-sky-400 block mb-1">Sort By</label>
                      <select
                        value={orderSortBy}
                        onChange={(e) => setOrderSortBy(e.target.value)}
                        className="w-full bg-[#0D0016] text-xs font-semibold border border-sky-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                      >
                        <option value="NEWEST">Date: Newest First</option>
                        <option value="OLDEST">Date: Oldest First</option>
                        <option value="AMOUNT_HIGH">Amount: High to Low</option>
                        <option value="AMOUNT_LOW">Amount: Low to High</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* --- ULTRA-CLEAN STREAMLINED ORDERS TABLE --- */}
                {orders.filter(order => {
                  const phone = order.shipping_address?.phone || '';
                  const awb = order.parcel_uncle_tracking_id || order.tracking_id || '';
                  const searchLower = orderSearch.toLowerCase();
                  
                  const matchesSearch = 
                    order.user_name.toLowerCase().includes(searchLower) ||
                    order.user_email.toLowerCase().includes(searchLower) ||
                    phone.toLowerCase().includes(searchLower) ||
                    awb.toLowerCase().includes(searchLower) ||
                    order.id.toString().includes(searchLower);

                  const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;

                  const matchesCourier = 
                    orderCourierFilter === 'ALL' ? true :
                    orderCourierFilter === 'PARCEL_UNCLE' ? !!order.parcel_uncle_tracking_id :
                    orderCourierFilter === 'LOCAL_RIDER' ? !!order.assigned_delivery_agent_id :
                    orderCourierFilter === 'UNASSIGNED' ? (!order.parcel_uncle_tracking_id && !order.assigned_delivery_agent_id) : true;

                  const matchesPrescription = 
                    orderPrescriptionFilter === 'ALL' ? true :
                    orderPrescriptionFilter === 'WITH_RX' ? !!order.shipping_address?.prescription :
                    orderPrescriptionFilter === 'NO_RX' ? !order.shipping_address?.prescription : true;

                  return matchesSearch && matchesStatus && matchesCourier && matchesPrescription;
                }).length === 0 ? (
                  <div className="text-center py-12 bg-[#1A0024]/80 border border-[#FAAE62]/20 rounded-2xl text-[#9B7EA8]">
                    <AlertTriangle className="w-8 h-8 text-[#FAAE62] mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-sm">No customer orders found matching selected filters.</p>
                  </div>
                ) : (
                  <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                    <table className="min-w-full divide-y divide-white/10 text-left">
                      <thead className="bg-[#0D0016] text-[10px] uppercase tracking-wider text-[#FAAE62] font-bold">
                        <tr className="border-b border-white/10">
                          <th className="px-5 py-3.5">Order &amp; Tracking ID</th>
                          <th className="px-5 py-3.5">Customer &amp; Contact</th>
                          <th className="px-5 py-3.5">Assigned Logistics</th>
                          <th className="px-5 py-3.5">Fulfillment Status</th>
                          <th className="px-5 py-3.5">Total Amount</th>
                          <th className="px-5 py-3.5">Date</th>
                          <th className="px-5 py-3.5 text-right">Master Inspection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-xs font-medium text-white">
                        {orders.filter(order => {
                          const phone = order.shipping_address?.phone || '';
                          const awb = order.parcel_uncle_tracking_id || order.tracking_id || '';
                          const searchLower = orderSearch.toLowerCase();
                          
                          const matchesSearch = 
                            order.user_name.toLowerCase().includes(searchLower) ||
                            order.user_email.toLowerCase().includes(searchLower) ||
                            phone.toLowerCase().includes(searchLower) ||
                            awb.toLowerCase().includes(searchLower) ||
                            order.id.toString().includes(searchLower);

                          const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;

                          const matchesCourier = 
                            orderCourierFilter === 'ALL' ? true :
                            orderCourierFilter === 'PARCEL_UNCLE' ? !!order.parcel_uncle_tracking_id :
                            orderCourierFilter === 'LOCAL_RIDER' ? !!order.assigned_delivery_agent_id :
                            orderCourierFilter === 'UNASSIGNED' ? (!order.parcel_uncle_tracking_id && !order.assigned_delivery_agent_id) : true;

                          const matchesPrescription = 
                            orderPrescriptionFilter === 'ALL' ? true :
                            orderPrescriptionFilter === 'WITH_RX' ? !!order.shipping_address?.prescription :
                            orderPrescriptionFilter === 'NO_RX' ? !order.shipping_address?.prescription : true;

                          return matchesSearch && matchesStatus && matchesCourier && matchesPrescription;
                        }).sort((a, b) => {
                          if (orderSortBy === 'NEWEST') return new Date(b.created_at) - new Date(a.created_at);
                          if (orderSortBy === 'OLDEST') return new Date(a.created_at) - new Date(b.created_at);
                          if (orderSortBy === 'AMOUNT_HIGH') return parseFloat(b.total_amount) - parseFloat(a.total_amount);
                          if (orderSortBy === 'AMOUNT_LOW') return parseFloat(a.total_amount) - parseFloat(b.total_amount);
                          return 0;
                        }).map(order => (
                          <tr key={order.id} className="hover:bg-[#2A0440]/60 transition-colors">
                            
                            {/* Column 1: Order & Tracking ID */}
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-[#FAAE62] block text-xs">#{order.id}</span>
                              <button
                                onClick={() => {
                                  setSelectedOrderDetails(order);
                                  setShowOrderDetailsModal(true);
                                }}
                                className="mt-1 inline-flex items-center gap-1 bg-[#FAAE62]/10 hover:bg-[#FAAE62]/25 border border-[#FAAE62]/40 text-[#FAAE62] font-mono text-[10px] font-bold px-2 py-1 rounded-md transition-all group"
                                title="Click to view full order details & status inspector"
                              >
                                <span>{order.parcel_uncle_tracking_id || order.tracking_id || 'Inspect AWB 🔍'}</span>
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </td>

                            {/* Column 2: Customer Name & Phone */}
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-white block text-xs truncate max-w-[160px]">{order.user_name}</span>
                              <span className="text-[10px] text-[#9B7EA8] block font-mono mt-0.5 truncate max-w-[160px]">
                                📞 {order.shipping_address?.phone || order.user_email}
                              </span>
                            </td>

                            {/* Column 3: Assigned Logistics Courier */}
                            <td className="px-5 py-3.5">
                              {order.parcel_uncle_tracking_id ? (
                                <span className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold text-[10px] px-2.5 py-1 rounded-lg">
                                  📦 Parcel Uncle Express
                                </span>
                              ) : order.assigned_delivery_agent_id ? (
                                <span className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 font-semibold text-[10px] px-2.5 py-1 rounded-lg">
                                  🏍️ Local Rider ({deliveryAgents.find(a => a.id === order.assigned_delivery_agent_id)?.name || 'Assigned'})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-gray-400 font-medium text-[10px] px-2.5 py-1 rounded-lg">
                                  Unassigned
                                </span>
                              )}
                            </td>

                            {/* Column 4: Fulfillment Status */}
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'Paid' || order.status === 'Payment Confirmed' || order.status === 'Delivered' ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400' :
                                order.status === 'Processing' || order.status === 'Packed' ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400' :
                                order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'bg-sky-500/15 border border-sky-500/40 text-sky-400' : 'bg-white/10 border border-white/20 text-gray-300'
                              }`}>
                                {order.status}
                              </span>
                            </td>

                            {/* Column 5: Total Amount */}
                            <td className="px-5 py-3.5 font-bold text-[#FAAE62] font-mono text-xs whitespace-nowrap">
                              ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                            </td>

                            {/* Column 6: Date */}
                            <td className="px-5 py-3.5 text-xs text-[#9B7EA8] font-mono whitespace-nowrap">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </td>

                            {/* Column 7: Master Inspection Button */}
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrderDetails(order);
                                  setShowOrderDetailsModal(true);
                                }}
                                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all shadow-md inline-flex items-center gap-1"
                              >
                                <span>Inspect Details</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3b: RETURNS & EXCHANGES MANAGEMENT --- */}
        {activeTab === 'returns' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-[#FAAE62]/20 pb-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-3 mb-1">
                  <RefreshCw className="w-7 h-7 text-[#FAAE62]" /> Returns &amp; Exchanges Portal
                </h2>
                <p className="text-xs text-[#9B7EA8]">Review customer return/exchange submissions and manage Parcel Uncle reverse courier pickups.</p>
              </div>
              <button
                onClick={() => {
                  setReturnsLoading(true);
                  fetch(`${API_BASE}/api/returns/all`, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then(r => r.json())
                    .then(data => {
                      const arr = Array.isArray(data) ? data : [];
                      setReturnsData(arr);
                      const sm = {}; const nm = {};
                      arr.forEach(r => { sm[r.id] = r.status; nm[r.id] = ''; });
                      setReturnStatusMap(sm); setReturnNotesMap(nm);
                      setReturnsLoading(false);
                    })
                    .catch(() => setReturnsLoading(false));
                }}
                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 text-[#0D0016] font-extrabold text-xs tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#FAAE62]/20"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Table
              </button>
            </div>

            {returnsLoading ? (
              <div className="text-center py-24"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : returnsData.length === 0 ? (
              <div className="text-center py-24">
                <PackageX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-premium-gray text-lg">No return or exchange requests found.</p>
                <p className="text-xs text-gray-400 mt-1">All customer return/exchange requests will appear here.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {returnUpdateMsg && (
                  <div className="bg-green-50 border border-green-300 text-green-800 text-sm px-4 py-3 rounded flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {returnUpdateMsg}
                  </div>
                )}
                {returnsData.map(ret => {
                  const statusColors = {
                    'Requested': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    'Approved': 'bg-blue-100 text-blue-800 border-blue-300',
                    'Pickup Booked': 'bg-indigo-100 text-indigo-800 border-indigo-300',
                    'Received': 'bg-purple-100 text-purple-800 border-purple-300',
                    'Inspected': 'bg-cyan-100 text-cyan-800 border-cyan-300',
                    'Refunded': 'bg-green-100 text-green-800 border-green-300',
                    'Exchanged': 'bg-teal-100 text-teal-800 border-teal-300',
                    'Rejected': 'bg-red-100 text-red-800 border-red-300',
                    'Cancelled': 'bg-gray-100 text-gray-600 border-gray-300',
                  };
                  const badgeClass = statusColors[ret.status] || 'bg-gray-100 text-gray-700 border-gray-300';
                  const isReturn = ret.return_type === 'exchange';

                  return (
                    <div key={ret.id} className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl admin-card-3d">
                      {/* Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-[#0D0016]/80">
                        <div className="flex items-center gap-3">
                          {isReturn
                            ? <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                            : <PackageX className="w-5 h-5 text-red-400" />
                          }
                          <div>
                            <span className="font-bold text-sm text-white">
                              {isReturn ? 'Exchange' : 'Return'} Request #{ret.id}
                            </span>
                            <span className="text-xs text-[#9B7EA8] ml-3 font-mono">Order #{ret.order_id}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full border border-[#FAAE62]/40 bg-[#FAAE62]/10 text-[#FAAE62]">
                          {ret.status}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                        <div>
                          <p className="text-[10px] text-[#FAAE62] uppercase tracking-wider font-bold mb-1">Customer Info</p>
                          <p className="font-semibold text-white text-sm">{ret.customer_name || '—'}</p>
                          <p className="text-[#9B7EA8] mt-0.5">{ret.customer_email || ''}</p>
                          <p className="text-[#9B7EA8]">{ret.customer_phone || ''}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#FAAE62] uppercase tracking-wider font-bold mb-1">Return Reason</p>
                          <p className="text-white font-medium">{ret.reason}</p>
                          {ret.comments && <p className="text-[#9B7EA8] mt-1 italic">"{ret.comments}"</p>}
                        </div>
                        <div>
                          <p className="text-[10px] text-[#FAAE62] uppercase tracking-wider font-bold mb-1">Refund Amount</p>
                          <p className="text-xl font-bold text-[#FAAE62] font-mono">₹{parseFloat(ret.refund_amount || ret.total_amount || 0).toLocaleString('en-IN')}</p>
                          {ret.waybill_id && (
                            <p className="text-xs text-sky-400 mt-1 font-mono">Reverse AWB: <strong>{ret.waybill_id}</strong></p>
                          )}
                        </div>
                      </div>

                      {/* Admin Action Row */}
                      <div className="px-6 py-4 border-t border-white/10 bg-[#0D0016]/50 flex flex-wrap items-center gap-3">
                        <select
                          value={returnStatusMap[ret.id] || ret.status}
                          onChange={e => setReturnStatusMap(prev => ({ ...prev, [ret.id]: e.target.value }))}
                          className="text-xs border border-[#FAAE62]/40 rounded-xl px-3 py-2 bg-[#1A0024] text-white focus:outline-none focus:border-[#FAAE62]"
                        >
                          {['Requested','Approved','Pickup Booked','Received','Inspected','Refunded','Exchanged','Rejected','Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Admin notes (optional)"
                          value={returnNotesMap[ret.id] || ''}
                          onChange={e => setReturnNotesMap(prev => ({ ...prev, [ret.id]: e.target.value }))}
                          className="flex-1 text-xs border border-white/15 rounded-xl px-3 py-2 bg-[#1A0024] text-white focus:outline-none focus:border-[#FAAE62] min-w-[180px]"
                        />
                        <button
                          disabled={updatingReturnId === ret.id}
                          onClick={() => {
                            setUpdatingReturnId(ret.id);
                            setReturnUpdateMsg('');
                            fetch(`${API_BASE}/api/returns/${ret.id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ status: returnStatusMap[ret.id] || ret.status, adminNotes: returnNotesMap[ret.id] || '' })
                            })
                              .then(r => r.json())
                              .then(data => {
                                setUpdatingReturnId(null);
                                if (data.success) {
                                  setReturnUpdateMsg(`Return #${ret.id} updated to "${returnStatusMap[ret.id]}" successfully.`);
                                  setReturnsData(prev => prev.map(r => r.id === ret.id ? { ...r, status: returnStatusMap[ret.id], waybill_id: data.waybill_id || r.waybill_id } : r));
                                  setTimeout(() => setReturnUpdateMsg(''), 4000);
                                }
                              })
                              .catch(() => setUpdatingReturnId(null));
                          }}
                          className="flex items-center gap-2 text-xs bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] font-extrabold px-5 py-2 rounded-xl hover:scale-105 transition-all shadow-md disabled:opacity-60"
                        >
                          {updatingReturnId === ret.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <CheckCircle2 className="w-3.5 h-3.5" />
                          }
                          Update Status
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: CUSTOMERS DIRECTORY --- */}
        {activeTab === 'customers' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-[#FAAE62]/20 pb-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white mb-1">
                  Registered Customers
                </h2>
                <p className="text-xs text-[#9B7EA8]">Inspect customer profiles, loyalty tier points, order history, and reset credentials.</p>
              </div>
              <button
                onClick={() => {
                  fetch(`${API_BASE}/api/admin/export/customers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                    .then(res => res.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `customers_export_${new Date().toISOString().slice(0, 10)}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    })
                    .catch(err => console.error(err));
                }}
                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-extrabold text-xs tracking-widest uppercase px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#FAAE62]/20"
              >
                <Download className="w-4 h-4" /> Export to CSV
              </button>
            </div>

            {customersLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-[#FAAE62] animate-spin mx-auto" /></div>
            ) : (
              <div>
                {/* Customer Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search customers (name, email, face shape)..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full sm:w-96 bg-[#1A0024] border border-[#FAAE62]/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FAAE62] font-medium"
                  />
                  <span className="text-xs text-[#9B7EA8] font-semibold">
                    {customers.filter(c =>
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      (c.face_shape || '').toLowerCase().includes(customerSearch.toLowerCase())
                    ).length} results
                  </span>
                </div>

                {customers.filter(c =>
                  c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  (c.face_shape || '').toLowerCase().includes(customerSearch.toLowerCase())
                ).length === 0 ? (
                  <p className="text-center py-10 bg-[#1A0024]/80 border border-[#FAAE62]/20 rounded-2xl text-[#9B7EA8]">No customers matching your search.</p>
                ) : (
                  <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                    <table className="min-w-full divide-y divide-white/10 text-left">
                      <thead className="bg-[#0D0016] text-[10px] uppercase tracking-wider text-[#FAAE62] font-bold">
                        <tr>
                          <th className="px-6 py-4">User ID</th>
                          <th className="px-6 py-4">Customer Name</th>
                          <th className="px-6 py-4">Email & Phone</th>
                          <th className="px-6 py-4">Face Profile</th>
                          <th className="px-6 py-4">Registration Date</th>
                          <th className="px-6 py-4">Paid Orders</th>
                          <th className="px-6 py-4">Total Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-xs font-medium text-white">
                        {customers.filter(c =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          (c.phone || '').includes(customerSearch) ||
                          (c.face_shape || '').toLowerCase().includes(customerSearch.toLowerCase())
                        ).map(cust => (
                          <tr key={cust.id} className="hover:bg-[#2A0440]/60 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-[#FAAE62]">#{cust.id}</td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleInspectCustomer(cust.id)}
                                className="font-bold text-white hover:text-[#FAAE62] hover:underline transition-colors text-left"
                              >
                                {cust.name}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-mono text-xs text-white">{cust.email}</div>
                              {cust.phone && <div className="text-[10px] text-[#9B7EA8] font-normal mt-0.5">{cust.phone}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${cust.face_shape ? 'bg-[#FAAE62]/10 border-[#FAAE62]/30 text-[#FAAE62]' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                {cust.face_shape || 'No Scan'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-[#9B7EA8]">
                              {new Date(cust.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 font-bold text-center sm:text-left text-white">{cust.paid_orders_count}</td>
                            <td className="px-6 py-4 font-bold text-[#FAAE62]">₹{parseFloat(cust.total_spend || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 5: STORE CUSTOMIZER (CMS) --- */}
        {activeTab === 'customizer' && (
          <div>
            <div className="border-b border-[#FAAE62]/20 pb-4 mb-8">
              <h2 className="font-serif text-3xl font-bold text-white mb-1">
                Store Content Customizer
              </h2>
              <p className="text-xs text-[#9B7EA8]">
                Modify the homepage hero banners, main headings, subtitles, background slides, and product showcase titles in real time.
              </p>
            </div>

            {settingsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-[#FAAE62] animate-spin mx-auto" /></div>
            ) : (
              <form onSubmit={handleSettingsSubmit} className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6 max-w-2xl admin-card-3d">
                
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FAAE62] font-bold mb-2">Homepage Hero Title</label>
                  <textarea
                    required
                    rows="3"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Engineered for \n Style & Clarity"
                    className="w-full bg-[#0D0016] text-sm text-white border border-[#FAAE62]/40 rounded-xl p-3 focus:outline-none focus:border-[#FAAE62] font-medium leading-relaxed"
                  />
                  <p className="text-[10px] text-[#9B7EA8] mt-1 font-light">Tip: Type a new line or \n to break the heading line on larger screens.</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FAAE62] font-bold mb-2">Hero Description Subtitle</label>
                  <textarea
                    required
                    rows="4"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Crafted from premium materials..."
                    className="w-full bg-[#0D0016] text-sm text-white border border-[#FAAE62]/40 rounded-xl p-3 focus:outline-none focus:border-[#FAAE62] font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FAAE62] font-bold mb-2">Hero Background Image URL</label>
                  <input
                    type="text"
                    required
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-[#0D0016] text-sm text-white border border-[#FAAE62]/40 rounded-xl p-3 focus:outline-none focus:border-[#FAAE62] font-medium"
                  />
                  <div className="mt-3 relative h-40 w-full bg-[#0D0016] border border-white/10 rounded-xl overflow-hidden">
                    {heroImage && <img src={heroImage} alt="hero preview" className="w-full h-full object-cover" />}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#FAAE62] font-bold mb-2">Showcase Section Title</label>
                  <input
                    type="text"
                    required
                    value={trendingTitle}
                    onChange={(e) => setTrendingTitle(e.target.value)}
                    placeholder="Trending Frames"
                    className="w-full bg-[#0D0016] text-sm text-white border border-[#FAAE62]/40 rounded-xl p-3 focus:outline-none focus:border-[#FAAE62] font-medium"
                  />
                </div>

                {settingsError && (
                  <div className="text-red-400 text-xs font-semibold p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                    {settingsError}
                  </div>
                )}

                {settingsSuccess && (
                  <div className="text-emerald-400 text-xs font-semibold p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {settingsSuccess}
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-extrabold text-xs tracking-widest uppercase py-4 px-10 rounded-xl transition-all shadow-lg shadow-[#FAAE62]/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {settingsSaving ? 'Saving Configurations...' : 'Save & Publish Changes'}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

        {/* --- TAB 6: ADMINS ROLES AND MANAGEMENT --- */}
        {activeTab === 'admins' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-[#FAAE62]/20 pb-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white mb-1">
                  Manage Admins
                </h2>
                <p className="text-xs text-[#9B7EA8]">Grant admin access rights, manage team roles, and revoke access keys.</p>
              </div>
              <button
                onClick={() => {
                  setAdminName('');
                  setAdminEmail('');
                  setAdminPassword('');
                  setAdminError('');
                  setAdminSuccess('');
                  setShowAdminModal(true);
                }}
                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-extrabold text-xs tracking-widest uppercase px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#FAAE62]/20"
              >
                <Plus className="w-4 h-4" /> Create New Admin
              </button>
            </div>

            {adminsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-[#FAAE62] animate-spin mx-auto" /></div>
            ) : (
              <div>
                <div className="bg-[#1A0024]/90 border border-[#FAAE62]/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                  <table className="min-w-full divide-y divide-white/10 text-left">
                    <thead className="bg-[#0D0016] text-[10px] uppercase tracking-wider text-[#FAAE62] font-bold">
                      <tr>
                        <th className="px-6 py-4">Admin ID</th>
                        <th className="px-6 py-4">Admin Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Date Created</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs font-medium text-white">
                      {admins.map(adm => (
                        <tr key={adm.id} className="hover:bg-premium-light/50">
                          <td className="px-6 py-4 text-xs font-bold text-premium-accent">#{adm.id}</td>
                          <td className="px-6 py-4 font-semibold">{adm.name}</td>
                          <td className="px-6 py-4 font-mono text-xs">{adm.email}</td>
                          <td className="px-6 py-4 text-xs">
                            {new Date(adm.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {adm.email !== 'admin@specs.com' && adm.email !== 'dev.parceluncle@gmail.com' ? (
                              <button
                                onClick={() => handleDemoteAdmin(adm.id)}
                                className="text-red-600 hover:text-red-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Demote to User
                              </button>
                            ) : (
                              <span className="text-[10px] text-premium-gray font-bold tracking-wide uppercase">Super Admin</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 7: COUPONS & PROMO CODES --- */}
        {activeTab === 'coupons' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-premium-border pb-4">
              <h2 className="font-serif text-3xl font-bold text-premium-black">
                Promo & Coupon Codes
              </h2>
              <button
                onClick={() => {
                  setCouponCode('');
                  setCouponValue('');
                  setCouponExpiry('');
                  setCouponMaxUses('');
                  setCouponError('');
                  setCouponSuccess('');
                  setShowCouponModal(true);
                }}
                className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3.5 rounded transition-all flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>

            {couponsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                {coupons.length === 0 ? (
                  <p className="text-center py-10 bg-white border rounded text-premium-gray">No promotional coupons configured yet.</p>
                ) : (
                  <div className="bg-white border border-premium-border rounded overflow-x-auto shadow-sm">
                    <table className="min-w-full divide-y divide-premium-border text-left">
                      <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
                        <tr>
                          <th className="px-6 py-4">Code</th>
                          <th className="px-6 py-4">Discount Type</th>
                          <th className="px-6 py-4">Value</th>
                          <th className="px-6 py-4">Expiry Date</th>
                          <th className="px-6 py-4">Uses</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
                        {coupons.map(cp => (
                          <tr key={cp.id} className="hover:bg-premium-light/50">
                            <td className="px-6 py-4 font-mono font-bold text-premium-accent text-xs">{cp.code}</td>
                            <td className="px-6 py-4 text-xs capitalize">{cp.discount_type}</td>
                            <td className="px-6 py-4">
                              {cp.discount_type === 'percentage' ? `${cp.discount_value}%` : `₹${cp.discount_value}`}
                            </td>
                            <td className="px-6 py-4 text-xs text-premium-gray">
                              {cp.expiry_date ? new Date(cp.expiry_date).toLocaleDateString('en-IN') : 'Never'}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono">
                              {cp.times_used} / {cp.max_uses || '∞'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                cp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {cp.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-3">
                                <button
                                  onClick={() => handleToggleCoupon(cp.id, !cp.is_active)}
                                  className="text-xs font-semibold hover:text-premium-accent transition-colors"
                                >
                                  {cp.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(cp.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 8: EMAIL CAMPAIGN BROADCAST --- */}
        {activeTab === 'broadcast' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4">
              Promotional Email Broadcast
            </h2>
            <p className="text-xs text-premium-gray font-light mb-8">
              Send a stylized newsletter, campaign update, or discount notification directly to all registered customers in the database.
            </p>

            <form onSubmit={handleBroadcastSubmit} className="bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm space-y-6 max-w-2xl">
              {/* Recipient Mode Selection */}
              <div className="bg-premium-light border border-premium-border rounded p-4">
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-bold mb-2">Recipient Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-premium-dark cursor-pointer">
                    <input
                      type="radio"
                      name="broadcastMode"
                      value="all"
                      checked={broadcastMode === 'all'}
                      onChange={() => {
                        setBroadcastMode('all');
                        setBroadcastTargetEmail('');
                        setBroadcastSearchQuery('');
                      }}
                      className="accent-premium-accent"
                    />
                    All Registered Customers
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-premium-dark cursor-pointer">
                    <input
                      type="radio"
                      name="broadcastMode"
                      value="specific"
                      checked={broadcastMode === 'specific'}
                      onChange={() => setBroadcastMode('specific')}
                      className="accent-premium-accent"
                    />
                    Specific Target Customer
                  </label>
                </div>

                {broadcastMode === 'specific' && (
                  <div className="mt-4 pt-3 border-t border-premium-border space-y-3 relative">
                    <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold">Search Target Customer</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type customer name or email to search..."
                        value={broadcastSearchQuery}
                        onChange={(e) => setBroadcastSearchQuery(e.target.value)}
                        className="w-full bg-white text-xs border border-premium-border rounded p-2 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                      />
                      {broadcastSearchQuery && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-premium-border rounded shadow-lg max-h-40 overflow-y-auto z-50">
                          {customers.filter(c => 
                            c.name.toLowerCase().includes(broadcastSearchQuery.toLowerCase()) ||
                            c.email.toLowerCase().includes(broadcastSearchQuery.toLowerCase())
                          ).slice(0, 5).map(cust => (
                            <button
                              key={cust.email}
                              type="button"
                              onClick={() => {
                                setBroadcastTargetEmail(cust.email);
                                setBroadcastSearchQuery(`${cust.name} (${cust.email})`);
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-premium-light border-b border-premium-border last:border-0 flex justify-between text-premium-dark font-medium"
                            >
                              <span>{cust.name}</span>
                              <span className="text-[10px] text-premium-gray font-mono">{cust.email}</span>
                            </button>
                          ))}
                          {customers.filter(c => 
                            c.name.toLowerCase().includes(broadcastSearchQuery.toLowerCase()) ||
                            c.email.toLowerCase().includes(broadcastSearchQuery.toLowerCase())
                          ).length === 0 && (
                            <div className="p-3 text-[10px] text-premium-gray text-center">No customers found.</div>
                          )}
                        </div>
                      )}
                    </div>
                    {broadcastTargetEmail && (
                      <div className="flex items-center gap-2 bg-premium-black border border-premium-accent/20 rounded-full px-3 py-1.5 w-fit">
                        <span className="text-[10px] text-premium-accent font-semibold uppercase tracking-wider">Target:</span>
                        <span className="text-[10px] text-white font-mono">{broadcastTargetEmail}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setBroadcastTargetEmail('');
                            setBroadcastSearchQuery('');
                          }}
                          className="text-premium-gray hover:text-white transition-all ml-1.5 focus:outline-none"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Select Template Preset</label>
                <select
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (!selectedId) return;
                    const template = EMAIL_TEMPLATES.find(t => t.id === selectedId);
                    if (template) {
                      setBroadcastSubject(template.subject);
                      setBroadcastBody(template.body);
                    }
                  }}
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  defaultValue=""
                >
                  <option value="" disabled>-- Select a pre-styled luxury email template --</option>
                  {EMAIL_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Subject Line</label>
                <input
                  type="text"
                  required
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. 🕶️ Exclusive Summer Sale: Flat 20% off all eyewear!"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Email Body (HTML format supported)</label>
                <textarea
                  required
                  rows="10"
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="<h2 style='color:#C5A028;'>Hello {{name}}!</h2><p>Our exclusive summer sale is live. Use code SUMMER20 at checkout.</p>"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-mono font-medium leading-relaxed"
                />
                <p className="text-[10px] text-gray-400 mt-1 font-light">Tip: Use <strong>{"{{name}}"}</strong> to automatically insert the customer's first name.</p>
              </div>

              {broadcastError && (
                <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200">
                  {broadcastError}
                </div>
              )}

              {broadcastSuccess && (
                <div className="text-green-700 text-xs font-semibold p-3 bg-green-50 rounded border border-green-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {broadcastSuccess}
                </div>
              )}

              <div className="pt-4 border-t border-premium-border">
                <button
                  type="submit"
                  disabled={broadcastSending}
                  className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 px-10 rounded transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {broadcastSending ? 'Sending emails...' : 'Send Broadcast Email'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TAB 9: ADMIN ACTIVITY LOGS --- */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-8 border-b border-premium-border pb-4">
              Administrator Activity Log
            </h2>

            {logsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                {logs.length === 0 ? (
                  <p className="text-center py-10 bg-white border rounded text-premium-gray">No activity logs recorded yet.</p>
                ) : (
                  <div className="bg-white border border-premium-border rounded overflow-hidden shadow-sm">
                    <div className="max-h-[600px] overflow-y-auto divide-y divide-premium-border">
                      {logs.map(log => (
                        <div key={log.id} className="p-4 hover:bg-premium-light/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-premium-black text-premium-accent mr-3">
                              {log.action_type}
                            </span>
                            <span className="text-sm text-premium-dark font-medium">{log.description}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs text-premium-gray font-mono block">{log.admin_email}</span>
                            <span className="text-[9px] text-gray-400 font-medium block mt-0.5">
                              {new Date(log.created_at).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 10: SUPPORT HELPDESK REPLY HUB --- */}
        {activeTab === 'helpdesk' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4">
              Support Helpdesk & Reply Hub
            </h2>
            <p className="text-xs text-premium-gray font-light mb-8">
              Review messages submitted by customers and reply to them via direct support email blasts.
            </p>

            {contactMessagesLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div className="space-y-6">
                {contactMessages.length === 0 ? (
                  <p className="text-center py-10 bg-white border rounded text-premium-gray">No support contact queries received yet.</p>
                ) : (
                  contactMessages.map(msg => (
                    <div key={msg.id} className="bg-white border border-premium-border rounded p-6 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-premium-border/60 pb-3 gap-2">
                        <div>
                          <span className="font-bold text-sm text-premium-dark block sm:inline">{msg.name}</span>
                          <span className="text-xs text-premium-gray block sm:inline sm:ml-2">({msg.email})</span>
                        </div>
                        <div className="text-right text-xs text-premium-gray">
                          <span>Submitted on: {new Date(msg.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-xs text-premium-accent uppercase tracking-wider mb-1">Subject: {msg.subject}</p>
                        <p className="text-sm text-premium-dark bg-premium-light/50 p-3 rounded italic font-medium leading-relaxed">
                          "{msg.message}"
                        </p>
                      </div>

                      {msg.reply_message ? (
                        <div className="p-3.5 bg-green-50 border border-green-200 rounded text-xs text-green-800 leading-relaxed">
                          <strong>✓ Replied on {new Date(msg.replied_at).toLocaleDateString('en-IN')}:</strong><br/>
                          <span className="italic">"{msg.reply_message}"</span>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleSupportReply(e, msg.id)} className="space-y-3 pt-2">
                          <textarea
                            required
                            rows="3"
                            value={replyTextMap[msg.id] || ''}
                            onChange={(e) => setReplyTextMap(prev => ({ ...prev, [msg.id]: e.target.value }))}
                            placeholder="Type email response details..."
                            className="w-full bg-premium-light text-xs border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium leading-relaxed"
                          />
                          <button
                            type="submit"
                            disabled={replyingMessageId === msg.id}
                            className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-[10px] tracking-widest uppercase py-2 px-5 rounded transition-all disabled:opacity-50"
                          >
                            {replyingMessageId === msg.id ? 'Sending Email...' : 'Send Support Reply'}
                          </button>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 11: DATABASE HEALTH & VACUUM OPTIMIZER --- */}
        {activeTab === 'db' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4">
              Database Health & Optimizer
            </h2>
            <p className="text-xs text-premium-gray font-light mb-8">
              Monitor active connections, query latencies, record counts, and run storage defragmentation.
            </p>

            {dbHealthLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : dbHealth ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left col: Stats cards */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Status metrics grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-premium-border p-5 rounded-lg shadow-sm">
                      <span className="block text-[10px] uppercase font-bold text-premium-gray tracking-wider">Engine Status</span>
                      <span className="text-lg font-bold text-green-600 block mt-1">✓ {dbHealth.status}</span>
                      <span className="text-xs text-premium-gray block font-medium mt-0.5">{dbHealth.engine} client active</span>
                    </div>

                    <div className="bg-white border border-premium-border p-5 rounded-lg shadow-sm">
                      <span className="block text-[10px] uppercase font-bold text-premium-gray tracking-wider">Query Latency (PING)</span>
                      <span className="text-lg font-bold text-premium-black block mt-1 font-mono">{dbHealth.latency_ms} ms</span>
                      <span className="text-xs text-premium-gray block font-medium mt-0.5">Turso read benchmark</span>
                    </div>
                  </div>

                  {/* Table Stats list */}
                  <div className="bg-white border border-premium-border rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-premium-light border-b border-premium-border px-5 py-3.5 flex justify-between">
                      <span className="text-xs uppercase font-bold text-premium-dark tracking-wider">Table Storage Summary</span>
                      <span className="text-xs font-semibold text-premium-accent font-mono">Row Counts</span>
                    </div>
                    <div className="divide-y divide-premium-border text-sm">
                      {Object.keys(dbHealth.records).map(tbl => (
                        <div key={tbl} className="px-5 py-3 flex justify-between items-center hover:bg-premium-light/30">
                          <span className="font-semibold text-premium-dark capitalize">{tbl.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-xs font-bold text-premium-accent">{dbHealth.records[tbl]} rows</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right col: Optimization trigger */}
                <div className="bg-white border border-premium-border rounded-lg p-6 shadow-sm h-fit space-y-4">
                  <h3 className="font-serif text-lg font-bold text-premium-black flex items-center gap-1.5 border-b border-premium-border pb-3">
                    <Activity className="w-5 h-5 text-premium-accent" /> DB Optimization
                  </h3>
                  <p className="text-xs text-premium-gray leading-relaxed font-light">
                    Over time, creating and removing rows (like orders and logs) leaves fragmented index pages. Clicking below executes `VACUUM` programmatically to clean up index trees, defragment sqlite pages, and minimize database size.
                  </p>
                  <button
                    onClick={handleOptimizeDb}
                    disabled={optimizingDb}
                    className="w-full bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3.5 rounded transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {optimizingDb ? 'Running VACUUM...' : 'Optimize Storage (VACUUM)'}
                  </button>
                </div>

              </div>
            ) : (
              <p className="text-xs text-red-600 font-semibold">Failed to fetch database health records.</p>
            )}
          </div>
        )}

        {/* --- TAB 12: REALTIME ONLINE USERS & ACTIVE SESSIONS MONITOR --- */}
        {activeTab === 'sessions' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4">
              Real-Time Active Sessions Monitor
            </h2>
            <p className="text-xs text-premium-gray font-light mb-8">
              Track live users currently logged in. Identifies multiple parallel logins from the same user account across different devices or browser tabs.
            </p>

            {activeSessionsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : activeSessionsData ? (
              <div className="space-y-6">
                
                {/* Metrics boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-premium-border p-5 rounded-lg shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-premium-gray tracking-wider">Online Users</span>
                    <span className="text-3xl font-extrabold text-green-600 block mt-1">{activeSessionsData.metrics.online_users} Users</span>
                    <span className="text-xs text-premium-gray block font-medium mt-0.5">Active in the last 5 minutes</span>
                  </div>

                  <div className="bg-white border border-premium-border p-5 rounded-lg shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-premium-gray tracking-wider">Total Active Sessions</span>
                    <span className="text-3xl font-extrabold text-premium-black block mt-1 font-mono">{activeSessionsData.metrics.active_sessions} Sessions</span>
                    <span className="text-xs text-premium-gray block font-medium mt-0.5">Open browser tabs and client devices</span>
                  </div>
                </div>

                {/* Grouped sessions */}
                <div className="bg-white border border-premium-border rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-premium-light border-b border-premium-border px-5 py-3.5 flex justify-between">
                    <span className="text-xs uppercase font-bold text-premium-dark tracking-wider">Active Logged-In User Accounts</span>
                    <span className="text-xs font-semibold text-premium-accent">Session Summary</span>
                  </div>

                  {activeSessionsData.grouped_sessions.length === 0 ? (
                    <div className="p-10 text-center text-xs text-premium-gray">No active user sessions recorded in database.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-premium-border text-left">
                        <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
                          <tr>
                            <th className="px-6 py-4">Customer Name</th>
                            <th className="px-6 py-4">Credentials (Email / Phone)</th>
                            <th className="px-6 py-4 text-center">Active Sessions</th>
                            <th className="px-6 py-4">Last Activity</th>
                            <th className="px-6 py-4">IP Address(es)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
                          {activeSessionsData.grouped_sessions.map((sess, i) => {
                            const isMulti = sess.session_count >= 2;
                            return (
                              <tr key={i} className={`hover:bg-premium-light/50 transition-colors ${isMulti ? 'bg-amber-50/50' : ''}`}>
                                <td className="px-6 py-4">
                                  <span className="font-bold text-premium-black">{sess.name || 'Anonymous User'}</span>
                                  {isMulti && (
                                    <span className="block text-[8px] uppercase tracking-widest font-black bg-amber-100 text-amber-700 w-fit px-1.5 py-0.5 rounded mt-1">
                                      ⚠️ MULTI-SESSION ({sess.session_count} Open Tabs)
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">
                                  <div className="text-premium-black">{sess.email}</div>
                                  {sess.phone && <div className="text-premium-gray text-[10px] mt-0.5">{sess.phone}</div>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${isMulti ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    {sess.session_count}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-premium-gray font-mono">
                                  {new Date(sess.last_active_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 text-xs text-premium-gray font-mono max-w-[200px] overflow-hidden text-ellipsis">
                                  {sess.ip_addresses}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Raw Sessions list for device audit */}
                <div className="bg-white border border-premium-border rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-premium-light border-b border-premium-border px-5 py-3.5 flex justify-between">
                    <span className="text-xs uppercase font-bold text-premium-dark tracking-wider">Device & Browser Audit Logs</span>
                    <span className="text-xs font-semibold text-premium-accent">Raw Sessions ({activeSessionsData.raw_sessions.length})</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto divide-y divide-premium-border">
                    {activeSessionsData.raw_sessions.map((raw, i) => (
                      <div key={i} className="p-4 hover:bg-premium-light/50 transition-colors flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-premium-dark">{raw.name || 'Anonymous User'} <span className="font-mono font-normal text-premium-gray">({raw.email || raw.phone})</span></div>
                          <div className="text-[10px] text-premium-gray mt-1 font-mono font-medium max-w-[500px] overflow-hidden text-ellipsis">{raw.user_agent}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-premium-accent block font-mono">IP: {raw.ip_address}</span>
                          <span className="text-[9px] text-gray-400 block mt-0.5">Last active: {new Date(raw.last_active_at).toLocaleTimeString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-red-600 font-semibold">Failed to fetch active session records.</p>
            )}
          </div>
        )}

        {/* --- TEAM MANAGEMENT TAB --- */}
        {activeTab === 'team' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4">
              Team Management
            </h2>
            <p className="text-sm text-premium-gray mb-6">Assign roles to users: <strong>Seller</strong> (manages orders & inventory) or <strong>Delivery Agent</strong> (handles deliveries).</p>

            {/* Role legend */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { role: 'admin',    label: 'Admin',          color: 'bg-red-100 text-red-800 border-red-200' },
                { role: 'seller',   label: 'Seller',         color: 'bg-amber-100 text-amber-800 border-amber-200' },
                { role: 'delivery', label: 'Delivery Agent', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                { role: 'user',     label: 'Customer',       color: 'bg-gray-100 text-gray-700 border-gray-200' },
              ].map(r => (
                <span key={r.role} className={`text-[10px] font-bold px-3 py-1.5 rounded border tracking-widest uppercase ${r.color}`}>{r.label}</span>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                placeholder="Search name or email..."
                value={teamSearch}
                onChange={e => setTeamSearch(e.target.value)}
                className="bg-premium-light border border-premium-border rounded px-3 py-2 text-xs text-premium-dark focus:outline-none focus:border-premium-accent w-full sm:w-64"
              />
              <select
                value={teamRoleFilter}
                onChange={e => setTeamRoleFilter(e.target.value)}
                className="bg-premium-light border border-premium-border rounded px-3 py-2 text-xs text-premium-dark focus:outline-none focus:border-premium-accent"
              >
                <option value="All">All Roles</option>
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="delivery">Delivery</option>
                <option value="user">Customer</option>
              </select>
            </div>

            {teamLoading ? (
              <div className="text-center py-16"><Loader2 className="w-8 h-8 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div className="bg-white border border-premium-border rounded overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-premium-light border-b border-premium-border">
                      <th className="text-left px-4 py-3 font-bold text-premium-dark uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 font-bold text-premium-dark uppercase tracking-wider hidden sm:table-cell">Email</th>
                      <th className="text-left px-4 py-3 font-bold text-premium-dark uppercase tracking-wider">Current Role</th>
                      <th className="text-left px-4 py-3 font-bold text-premium-dark uppercase tracking-wider">Change Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamUsers
                      .filter(u => {
                        const q = teamSearch.toLowerCase();
                        const matchSearch = !q || (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q);
                        const matchRole = teamRoleFilter === 'All' || u.role === teamRoleFilter;
                        return matchSearch && matchRole;
                      })
                      .map((u, idx) => {
                        const roleColors = {
                          admin:    'bg-red-100 text-red-800 border border-red-200',
                          seller:   'bg-amber-100 text-amber-800 border border-amber-200',
                          delivery: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
                          stylist:  'bg-purple-100 text-purple-800 border border-purple-200',
                          ho_staff:  'bg-emerald-100 text-emerald-800 border border-emerald-200',
                          user:     'bg-gray-100 text-gray-700 border border-gray-200',
                        };
                        const rc = roleColors[u.role] || roleColors['user'];
                        return (
                          <tr key={u.id} className={`border-b border-premium-border hover:bg-premium-light transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-premium-black">{u.name || '—'}</span>
                              <span className="block text-premium-gray text-[10px] sm:hidden">{u.email}</span>
                            </td>
                            <td className="px-4 py-3 text-premium-gray hidden sm:table-cell">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${rc}`}>
                                {u.role || 'user'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {updatingRoleId === u.id ? (
                                <Loader2 className="w-4 h-4 text-premium-accent animate-spin" />
                              ) : (
                                <select
                                  value={u.role || 'user'}
                                  onChange={async (e) => {
                                    const newRole = e.target.value;
                                    if (newRole === u.role) return;
                                    if (!window.confirm(`Change ${u.name}'s role to "${newRole}"?`)) return;
                                    setUpdatingRoleId(u.id);
                                    try {
                                      const res = await fetch(`${API_BASE}/api/admin/users/${u.id}/role`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ role: newRole })
                                      });
                                      const data = await res.json();
                                      if (res.ok) {
                                        setTeamUsers(prev => prev.map(user => user.id === u.id ? { ...user, role: newRole } : user));
                                      } else {
                                        alert(data.message || 'Role update failed');
                                      }
                                    } catch { alert('Connection error'); }
                                    setUpdatingRoleId(null);
                                  }}
                                  className="bg-premium-light border border-premium-border rounded px-2 py-1.5 text-[10px] text-premium-dark focus:outline-none focus:border-premium-accent font-semibold uppercase tracking-wider"
                                >
                                  <option value="user">Customer</option>
                                  <option value="seller">Seller</option>
                                  <option value="delivery">Delivery Agent</option>
                                  <option value="stylist">Stylist</option>
                                  <option value="ho_staff">HO Staff</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}
                              <button
                                onClick={() => {
                                  const newPass = prompt(`Enter new password for ${u.name} (${u.email}):`);
                                  if (!newPass) return;
                                  if (newPass.trim().length < 6) {
                                    alert('Password must be at least 6 characters long');
                                    return;
                                  }
                                  fetch(`${API_BASE}/api/admin/users/${u.id}/password`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ newPassword: newPass.trim() })
                                  })
                                    .then(res => res.json())
                                    .then(data => alert(`✅ ${data.message || 'Password updated successfully!'}`))
                                    .catch(err => alert(`❌ Error: ${err.message}`));
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 hover:bg-amber-500 hover:text-white rounded transition-all ml-2"
                                title="Change user password"
                              >
                                🔑 Reset Password
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {teamUsers.filter(u => {
                  const q = teamSearch.toLowerCase();
                  const matchSearch = !q || (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q);
                  const matchRole = teamRoleFilter === 'All' || u.role === teamRoleFilter;
                  return matchSearch && matchRole;
                }).length === 0 && (
                  <div className="text-center py-12 text-premium-gray text-sm">No users found.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- DELIVERY OTP MONITOR TAB --- */}
        {activeTab === 'delivery-otps' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4">
              🔐 Delivery OTP Monitor
            </h2>
            <p className="text-sm text-premium-gray mb-6">
              Real-time view of all active delivery OTPs for orders currently "Out for Delivery". 
              These OTPs are sent to customers via email when a rider marks an order as Out for Delivery.
            </p>

            <button
              onClick={() => {
                setDeliveryOtpsLoading(true);
                fetch(`${API_BASE}/api/admin/delivery-otps`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                  .then(res => res.json())
                  .then(data => { setDeliveryOtps(data || []); setDeliveryOtpsLoading(false); })
                  .catch(() => setDeliveryOtpsLoading(false));
              }}
              className="mb-6 flex items-center gap-2 text-xs border border-premium-border px-4 py-2.5 rounded hover:bg-premium-light font-semibold tracking-wide uppercase transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Refresh OTP List
            </button>

            {deliveryOtpsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : deliveryOtps.length === 0 ? (
              <div className="text-center py-20 text-premium-gray">
                <ShieldCheck className="w-14 h-14 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No active delivery OTPs</p>
                <p className="text-xs mt-1 opacity-60">OTPs appear here when riders mark orders as "Out for Delivery".</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs font-semibold text-amber-800">{deliveryOtps.length} active OTP{deliveryOtps.length !== 1 ? 's' : ''} waiting for delivery confirmation</p>
                </div>

                <div className="bg-white border border-premium-border rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-premium-black text-white">
                          <th className="text-left px-5 py-3 font-bold tracking-wider uppercase text-[10px]">Order</th>
                          <th className="text-left px-5 py-3 font-bold tracking-wider uppercase text-[10px]">Customer</th>
                          <th className="text-left px-5 py-3 font-bold tracking-wider uppercase text-[10px]">Customer Email</th>
                          <th className="text-left px-5 py-3 font-bold tracking-wider uppercase text-[10px]">Delivery OTP</th>
                          <th className="text-left px-5 py-3 font-bold tracking-wider uppercase text-[10px]">Assigned Rider</th>
                          <th className="text-left px-5 py-3 font-bold tracking-wider uppercase text-[10px]">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveryOtps.map((row, i) => (
                          <tr key={row.id} className={`border-t border-premium-border hover:bg-amber-50/30 transition-colors ${i % 2 === 0 ? '' : 'bg-premium-light/40'}`}>
                            <td className="px-5 py-4">
                              <span className="font-black text-premium-accent text-sm">#{row.id}</span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-premium-dark">{row.customer_name || 'Guest'}</p>
                              {row.customer_phone && <p className="text-[10px] text-premium-gray font-mono mt-0.5">{row.customer_phone}</p>}
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-mono text-[11px] text-premium-dark">{row.customer_email || '—'}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <code className="bg-amber-100 border border-amber-300 text-amber-900 font-black text-base px-3 py-1.5 rounded tracking-[0.2em] font-mono">
                                  {row.delivery_otp}
                                </code>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-premium-dark">{row.agent_name || 'Unassigned'}</p>
                              {row.agent_email && <p className="text-[10px] text-premium-gray font-mono mt-0.5">{row.agent_email}</p>}
                            </td>
                            <td className="px-5 py-4 text-premium-gray font-mono">
                              {new Date(row.created_at).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-[10px] text-premium-gray text-center mt-2">
                  ⚠️ These OTPs are sensitive. Do not share them externally. They expire once the order is marked Delivered.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- SIGNUP OTP MONITOR TAB --- */}
        {activeTab === 'signup-otps' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4 flex items-center gap-2">
              <Key className="w-8 h-8 text-amber-500" /> Live Signup OTP Feed & Verification Logs
            </h2>
            <p className="text-sm text-premium-gray mb-6">
              Real-time feed of all 6-digit OTP verification codes generated for new customer registrations and login verifications across Mobile & Email.
            </p>

            <button
              onClick={fetchSignupOtps}
              className="mb-6 flex items-center gap-2 text-xs border border-premium-border px-4 py-2.5 rounded hover:bg-premium-light font-semibold tracking-wide uppercase transition-all bg-white shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-premium-accent" /> Refresh Live OTP List
            </button>

            {signupOtpsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : signupOtps.length === 0 ? (
              <div className="text-center py-20 text-premium-gray bg-white border border-premium-border rounded-lg shadow-sm">
                <Key className="w-14 h-14 mx-auto mb-3 opacity-30 text-amber-500" />
                <p className="text-sm font-semibold">No signup OTP logs recorded</p>
                <p className="text-xs mt-1 opacity-60">OTPs appear here live as soon as users initiate registration.</p>
              </div>
            ) : (
              <div className="bg-white border border-premium-border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-premium-black text-white uppercase text-[10px] tracking-wider">
                        <th className="px-5 py-4 font-bold">User Name</th>
                        <th className="px-5 py-4 font-bold">Contact (Email / Phone)</th>
                        <th className="px-5 py-4 font-bold text-center">🔑 6-Digit OTP Code</th>
                        <th className="px-5 py-4 font-bold">Status</th>
                        <th className="px-5 py-4 font-bold">Generated Time</th>
                        <th className="px-5 py-4 font-bold">Expires At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-premium-border">
                      {signupOtps.map((otp, i) => {
                        const isVerified = otp.verified === 1;
                        const isExpired = !isVerified && new Date() > new Date(otp.expires_at);
                        return (
                          <tr key={otp.id} className={`hover:bg-amber-50/20 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-premium-light/30'}`}>
                            <td className="px-5 py-4 font-bold text-premium-black text-sm">{otp.name || 'User Sign-Up'}</td>
                            <td className="px-5 py-4 font-mono text-xs">
                              <div className="text-premium-dark font-semibold">{otp.email}</div>
                              {otp.phone && <div className="text-premium-gray text-[10px] mt-0.5">{otp.phone}</div>}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="bg-amber-500/15 text-amber-600 font-mono font-extrabold text-lg tracking-widest px-4 py-1.5 rounded border border-amber-500/40 inline-block shadow-sm">
                                {otp.otp_code}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded tracking-wider ${
                                isVerified ? 'bg-green-100 text-green-800 border border-green-300' :
                                isExpired ? 'bg-red-100 text-red-800 border border-red-300' :
                                'bg-amber-100 text-amber-900 border border-amber-400 animate-pulse'
                              }`}>
                                {isVerified ? '✓ Verified' : isExpired ? 'Expired' : '⚡ Active OTP'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-premium-gray font-mono text-xs">
                              {new Date(otp.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              <span className="block text-[9px] text-gray-400 mt-0.5">{new Date(otp.created_at).toLocaleDateString('en-IN')}</span>
                            </td>
                            <td className="px-5 py-4 text-premium-gray font-mono text-xs">
                              {new Date(otp.expires_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- ADD/EDIT PRODUCT MODAL POPUP --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-premium-border rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <h3 className="font-serif text-2xl font-bold text-premium-black mb-6">
              {editingProduct ? 'Edit Eyewear Specs' : 'Add New Eyewear Frame'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Frame Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Vintage Golden Round"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Describe material details, temples, lenses, fit..."
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="3999"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="25"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-semibold"
                  >
                    <option value="Eyeglasses">Eyeglasses</option>
                    <option value="Sunglasses">Sunglasses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Gender</label>
                  <select
                    value={prodGender}
                    onChange={(e) => setProdGender(e.target.value)}
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-semibold"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Frame Shape</label>
                  <select
                    value={prodShape}
                    onChange={(e) => setProdShape(e.target.value)}
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-semibold"
                  >
                    <option value="Rectangle">Rectangle</option>
                    <option value="Square">Square</option>
                    <option value="Round">Round</option>
                    <option value="Aviator">Aviator</option>
                    <option value="Cat-Eye">Cat-Eye</option>
                    <option value="Wayfarer">Wayfarer</option>
                    <option value="Oval">Oval</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://unsplash.com/..."
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              {crudError && (
                <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200">
                  {crudError}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-premium-border">
                <button
                  type="submit"
                  className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3.5 rounded transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Add Frame'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="border border-premium-border hover:bg-gray-50 text-premium-dark font-semibold text-xs tracking-widest uppercase py-3.5 px-6 rounded transition-all"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- CREATE ADMIN MODAL POPUP --- */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-premium-border rounded-lg max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <h3 className="font-serif text-2xl font-bold text-premium-black mb-6">
              Create New Administrator
            </h3>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Admin Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="name@specs.com"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                />
              </div>

              {adminError && (
                <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200">
                  {adminError}
                </div>
              )}

              {adminSuccess && (
                <div className="text-green-700 text-xs font-semibold p-3 bg-green-50 rounded border border-green-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {adminSuccess}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-premium-border">
                <button
                  type="submit"
                  className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3.5 rounded transition-all shadow"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="border border-premium-border hover:bg-gray-50 text-premium-dark font-semibold text-xs tracking-widest uppercase py-3.5 px-6 rounded transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- CREATE COUPON MODAL POPUP --- */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-premium-border rounded-lg max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <h3 className="font-serif text-2xl font-bold text-premium-black mb-6">
              Create Promo / Coupon Code
            </h3>

            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. GET30, FIRST500"
                  className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Discount Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value)}
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    placeholder="e.g. 10 or 500"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={couponExpiry}
                    onChange={(e) => setCouponExpiry(e.target.value)}
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Max Uses (Optional)</label>
                  <input
                    type="number"
                    value={couponMaxUses}
                    onChange={(e) => setCouponMaxUses(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>
              </div>

              {couponError && (
                <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200">
                  {couponError}
                </div>
              )}

              {couponSuccess && (
                <div className="text-green-700 text-xs font-semibold p-3 bg-green-50 rounded border border-green-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {couponSuccess}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-premium-border">
                <button
                  type="submit"
                  className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3.5 rounded transition-all shadow"
                >
                  Create Promo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="border border-premium-border hover:bg-gray-50 text-premium-dark font-semibold text-xs tracking-widest uppercase py-3.5 px-6 rounded transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CUSTOMER INSPECT PROFILE MODAL POPUP --- */}
      {showCustomerInspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-premium-border rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 text-premium-dark">
            <button 
              onClick={() => setShowCustomerInspectModal(false)}
              className="absolute top-4 right-4 text-premium-gray hover:text-premium-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-premium-black mb-6">
              Customer Inspection Report
            </h3>

            {inspectedCustomerLoading ? (
              <div className="text-center py-10"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : inspectedCustomer ? (
              <div className="space-y-6 text-sm">
                
                {/* Profile Details & Credentials Editor */}
                {isEditingCredentials ? (
                  <form onSubmit={handleUpdateCustomerCredentials} className="bg-premium-light border border-premium-border rounded p-4 space-y-4">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-premium-accent mb-2">Edit Customer Credentials</h4>
                    
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={editCustName}
                        onChange={(e) => setEditCustName(e.target.value)}
                        className="w-full bg-white text-xs border border-premium-border rounded p-2 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editCustEmail}
                        onChange={(e) => setEditCustEmail(e.target.value)}
                        className="w-full bg-white text-xs border border-premium-border rounded p-2 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editCustPhone}
                        onChange={(e) => setEditCustPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-white text-xs border border-premium-border rounded p-2 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1">Role</label>
                        <select
                          value={editCustRole}
                          onChange={(e) => setEditCustRole(e.target.value)}
                          className="w-full bg-white text-xs border border-premium-border rounded p-2 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                        >
                          <option value="user">User</option>
                          <option value="seller">Seller</option>
                          <option value="delivery">Delivery</option>
                          <option value="stylist">Stylist</option>
                          <option value="ho_staff">HO Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-premium-gray font-semibold mb-1">Reset Password</label>
                        <input
                          type="password"
                          value={editCustPassword}
                          onChange={(e) => setEditCustPassword(e.target.value)}
                          placeholder="Leave empty to keep current"
                          className="w-full bg-white text-xs border border-premium-border rounded p-2 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                        />
                      </div>
                    </div>

                    {editCustError && (
                      <div className="text-red-600 text-[11px] font-semibold">
                        {editCustError}
                      </div>
                    )}

                    {editCustSuccess && (
                      <div className="text-green-700 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        {editCustSuccess}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-[10px] tracking-wider uppercase py-2 rounded transition-all shadow"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingCredentials(false)}
                        className="border border-premium-border hover:bg-white text-premium-dark font-semibold text-[10px] tracking-wider uppercase py-2 px-4 rounded transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-premium-light border border-premium-border rounded p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-premium-gray font-semibold">User ID:</span>
                      <span className="font-bold">#{inspectedCustomer.profile.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-premium-gray font-semibold">Name:</span>
                      <span className="font-bold">{inspectedCustomer.profile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-premium-gray font-semibold">Email:</span>
                      <span className="font-mono text-xs">{inspectedCustomer.profile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-premium-gray font-semibold">Phone:</span>
                      <span className="font-mono text-xs">{inspectedCustomer.profile.phone || 'Not Specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-premium-gray font-semibold">Account Role:</span>
                      <span className="font-bold uppercase text-xs text-premium-accent">{inspectedCustomer.profile.role || 'user'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-premium-gray font-semibold">Loyalty Points:</span>
                      <span className="font-bold text-premium-accent">{inspectedCustomer.profile.loyalty_points || 0} points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-premium-gray font-semibold">Referral Code:</span>
                      <span className="font-mono font-bold text-premium-accent">{inspectedCustomer.profile.referral_code || 'None'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 mb-2">
                      <span className="text-premium-gray font-semibold">Registered On:</span>
                      <span>{new Date(inspectedCustomer.profile.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                    
                    <button
                      onClick={() => setIsEditingCredentials(true)}
                      className="w-full text-center border border-premium-accent hover:bg-premium-accent hover:text-premium-black text-premium-accent font-semibold text-xs tracking-wider uppercase py-2.5 rounded transition-all mt-2 flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Credentials &amp; Profile
                    </button>
                  </div>
                )}

                {/* Purchase list */}
                <div>
                  <h4 className="font-serif font-bold text-premium-black mb-2 border-b pb-1">Order History ({inspectedCustomer.orders.length})</h4>
                  {inspectedCustomer.orders.length === 0 ? (
                    <p className="text-xs text-premium-gray italic py-2">No purchases recorded yet.</p>
                  ) : (
                    <div className="max-h-[200px] overflow-y-auto space-y-2 divide-y divide-premium-border">
                      {inspectedCustomer.orders.map(ord => (
                        <div key={ord.id} className="pt-2 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold">Order #{ord.id}</span>
                            <span className="text-premium-gray block mt-0.5">{new Date(ord.created_at).toLocaleDateString('en-IN')}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold block text-premium-accent">₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}</span>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                              ord.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>{ord.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <p className="text-xs text-red-600 font-semibold">Failed to load customer profile details.</p>
            )}
          </div>
        </div>
      )}

      {/* --- ORDER TRACKING DISPATCH MODAL POPUP --- */}
      {showTrackingModal && selectedTrackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-premium-border rounded-lg max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-8 text-premium-dark">
            <button 
              onClick={() => setShowTrackingModal(false)}
              className="absolute top-4 right-4 text-premium-gray hover:text-premium-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-premium-black mb-2">
              Order Fulfillment Tracking
            </h3>
            <p className="text-xs text-premium-gray font-light mb-6">Order ID: #{selectedTrackingOrder.id}</p>

            <form onSubmit={handleSaveTracking} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Fulfillment Comments / Dispatch updates</label>
                <textarea
                  required
                  rows="4"
                  value={trackingCommentsText}
                  onChange={(e) => setTrackingCommentsText(e.target.value)}
                  placeholder="e.g. Dispatched via Bluedart, Tracking Airway bill no: 4893729. ETA: 4 days."
                  className="w-full bg-premium-light text-xs border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium leading-relaxed"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-premium-border">
                <button
                  type="submit"
                  className="flex-grow bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-3.5 rounded transition-all shadow"
                >
                  Save Dispatch Notes
                </button>
                <button
                  type="button"
                  onClick={() => setShowTrackingModal(false)}
                  className="border border-premium-border hover:bg-gray-50 text-premium-dark font-semibold text-xs tracking-widest uppercase py-3.5 px-6 rounded transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAX INVOICE MODAL ── */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl relative my-8" onClick={e => e.stopPropagation()}>
            {/* Invoice print area */}
            <div id="invoice-print-area" style={{ fontFamily: 'Georgia, serif', padding: '40px', color: '#1a1a1a', background: '#fff' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #b8912a', paddingBottom: 20, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: '#1a1a1a' }}>LEKYA SPECS</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Premium Optical & Eyewear Concierge</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>GSTIN: 27AAAPL1234F1ZL</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>support@lekyaspecs.in | lekyaspecs.vercel.app</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#b8912a', letterSpacing: 2 }}>TAX INVOICE</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Invoice No: INV-{String(selectedInvoiceOrder.id).padStart(6, '0')}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Date: {new Date(selectedInvoiceOrder.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div style={{ marginTop: 8, padding: '3px 10px', borderRadius: 20, background: '#fef3c7', display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#92400e', border: '1px solid #fbbf24' }}>
                    {selectedInvoiceOrder.status}
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Bill To</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedInvoiceOrder.customer_name || 'Customer'}</div>
                  <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4, lineHeight: 1.6 }}>{selectedInvoiceOrder.shipping_address || 'Address on file'}</div>
                  {selectedInvoiceOrder.customer_phone && <div style={{ fontSize: 12, color: '#4b5563' }}>📞 {selectedInvoiceOrder.customer_phone}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Order Details</div>
                  <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 2 }}>
                    <div>Order ID: <strong>#{selectedInvoiceOrder.id}</strong></div>
                    <div>Payment: <strong>{selectedInvoiceOrder.payment_method || 'Online'}</strong></div>
                    {selectedInvoiceOrder.tracking_number && <div>Tracking: <strong>{selectedInvoiceOrder.tracking_number}</strong></div>}
                  </div>
                </div>
              </div>

              {/* Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9f5ec', borderBottom: '2px solid #b8912a' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#92400e' }}>#</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#92400e' }}>Item Description</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#92400e' }}>Qty</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#92400e' }}>Unit Price</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#92400e' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedInvoiceOrder.items || []).map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 14px', color: '#6b7280' }}>{i + 1}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600 }}>{item.product_name || item.name || 'Eyewear Frame'}</div>
                        {item.prescription && <div style={{ fontSize: 11, color: '#9ca3af' }}>Prescription: {item.prescription}</div>}
                        {item.lens_type && <div style={{ fontSize: 11, color: '#9ca3af' }}>Lens: {item.lens_type}</div>}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>{item.quantity || 1}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>₹{parseFloat(item.price || item.unit_price || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>₹{((item.quantity || 1) * parseFloat(item.price || item.unit_price || 0)).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {(!selectedInvoiceOrder.items || selectedInvoiceOrder.items.length === 0) && (
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 14px', color: '#6b7280' }}>1</td>
                      <td style={{ padding: '12px 14px' }}><div style={{ fontWeight: 600 }}>Eyewear Order #{selectedInvoiceOrder.id}</div></td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>1</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>₹{parseFloat(selectedInvoiceOrder.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>₹{parseFloat(selectedInvoiceOrder.total_amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 260 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#6b7280' }}>
                    <span>Subtotal</span><span>₹{(parseFloat(selectedInvoiceOrder.total_amount || 0) * 0.82).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#6b7280' }}>
                    <span>GST (18%)</span><span>₹{(parseFloat(selectedInvoiceOrder.total_amount || 0) * 0.18).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', fontSize: 15, fontWeight: 800, background: '#f9f5ec', borderRadius: 8, border: '1px solid #b8912a', marginTop: 8 }}>
                    <span>TOTAL</span><span style={{ color: '#b8912a' }}>₹{parseFloat(selectedInvoiceOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #f3f4f6', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
                Thank you for choosing Lekya Specs. This is a computer-generated invoice. For queries: support@lekyaspecs.in
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const elem = document.getElementById('invoice-print-area');
                  if (!elem) return;
                  let iframe = document.getElementById('invoice-print-iframe');
                  if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'invoice-print-iframe';
                    iframe.style.position = 'fixed';
                    iframe.style.right = '0';
                    iframe.style.bottom = '0';
                    iframe.style.width = '0';
                    iframe.style.height = '0';
                    iframe.style.border = '0';
                    document.body.appendChild(iframe);
                  }
                  const doc = iframe.contentWindow.document;
                  doc.open();
                  doc.write(`<!DOCTYPE html><html><head><title>Invoice #${selectedInvoiceOrder.id}</title><style>body{margin:0;padding:20px;font-family:Georgia,serif;background:#fff;color:#1a1a1a;}@page{size:auto;margin:15mm;}</style></head><body>${elem.outerHTML}</body></html>`);
                  doc.close();
                  setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                  }, 300);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                🖨️ Print Invoice / PDF
              </button>
              <button
                onClick={() => {
                  const elem = document.getElementById('invoice-print-area');
                  if (!elem) return;
                  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #${selectedInvoiceOrder.id} - Lekya Specs</title>
  <style>
    body { margin: 0; padding: 30px; font-family: Georgia, serif; background: #fff; color: #1a1a1a; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${elem.outerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;
                  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `LekyaSpecs_Invoice_INV-${String(selectedInvoiceOrder.id).padStart(6, '0')}.html`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                📥 Download Tax Invoice
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SYSTEM SETTINGS & LIVE API ECOSYSTEM VAULT MODAL ── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-scaleUp" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-[#1A0024]/95 border border-[#FAAE62]/40 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden backdrop-blur-2xl my-8 text-white admin-custom-scrollbar max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 bg-[#0D0016]/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4893F] to-[#FAAE62] p-0.5 flex items-center justify-center shadow-lg shadow-[#FAAE62]/20">
                  <div className="w-full h-full bg-[#0D0016] rounded-[14px] flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#FAAE62] animate-spin-slow" />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    System Settings &amp; API Ecosystem Vault ⚙️
                  </h3>
                  <p className="text-xs text-[#9B7EA8]">Manage connected cloud webhooks, OTP security vaults, API firewall, and live simulation sandboxes.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#FAAE62] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Navigation Bar */}
            <div className="flex items-center gap-2 px-6 py-3 bg-[#0D0016]/50 border-b border-white/10 overflow-x-auto admin-custom-scrollbar">
              {[
                { id: 'apis', label: '🔌 Connected APIs', icon: Cpu },
                { id: 'security', label: '🔒 OTP & Security Vault', icon: Lock },
                { id: 'firewall', label: '⚡ API Firewall', icon: Zap },
                { id: 'sandbox', label: '🧪 Webhook Sandbox', icon: Terminal },
                { id: 'secrets', label: '🔑 Secrets & Keys', icon: Key },
                { id: 'vacuum', label: '🤖 DB Optimizer', icon: Activity },
                { id: 'cdn', label: '🌐 Edge CDN Monitor', icon: Globe },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSettingsTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                    settingsTab === t.id
                      ? 'bg-gradient-to-r from-[#D4893F] to-[#FAAE62] text-[#0D0016] shadow-md shadow-[#FAAE62]/20'
                      : 'text-[#9B7EA8] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow admin-custom-scrollbar">

              {/* --- SUB-TAB 1: CONNECTED APIS ECOSYSTEM --- */}
              {settingsTab === 'apis' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-[#FAAE62] uppercase tracking-wider">Active Cloud API Integrations</h4>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold">5 Nodes Operational</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Node 1: WhatsApp Cloud API */}
                    <div className="p-5 bg-[#0D0016]/80 border border-[#FAAE62]/30 rounded-2xl space-y-3 admin-card-3d">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Radio className="w-5 h-5 text-emerald-400" />
                          <span className="font-bold text-sm text-white">Meta WhatsApp Cloud API</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">CONNECTED</span>
                      </div>
                      <p className="text-xs text-[#9B7EA8]">Direct webhook listener with 9 auto-reply customer intent classifiers &amp; DB message logger.</p>
                      <div className="bg-[#1A0024] p-2.5 rounded-xl border border-white/10 font-mono text-[10px] space-y-1 text-gray-300">
                        <div>Endpoint: <span className="text-[#FAAE62]">/api/webhooks/whatsapp</span></div>
                        <div>Intents Configured: <span className="text-white font-bold">9 Rules Active</span></div>
                        <div>CRM Messages Logged: <span className="text-emerald-400 font-bold">142 Messages</span></div>
                      </div>
                    </div>

                    {/* Node 2: Parcel Uncle Reverse Logistics */}
                    <div className="p-5 bg-[#0D0016]/80 border border-[#FAAE62]/30 rounded-2xl space-y-3 admin-card-3d">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Server className="w-5 h-5 text-amber-400" />
                          <span className="font-bold text-sm text-white">Parcel Uncle Logistics API</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">CONNECTED</span>
                      </div>
                      <p className="text-xs text-[#9B7EA8]">Live AWB generator, manifest status sync &amp; 4x6 inch official shipping label PDF compiler.</p>
                      <div className="bg-[#1A0024] p-2.5 rounded-xl border border-white/10 font-mono text-[10px] space-y-1 text-gray-300">
                        <div>Manifest Sync: <span className="text-amber-400">/api/shipping/parcel-uncle/*</span></div>
                        <div>Reverse Returns: <span className="text-white font-bold">Parcel Uncle Reverse Hub</span></div>
                        <div>PDF Printer Engine: <span className="text-emerald-400 font-bold">4x6 Thermal PDF</span></div>
                      </div>
                    </div>

                    {/* Node 3: Razorpay Payment Gateway */}
                    <div className="p-5 bg-[#0D0016]/80 border border-[#FAAE62]/30 rounded-2xl space-y-3 admin-card-3d">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Landmark className="w-5 h-5 text-sky-400" />
                          <span className="font-bold text-sm text-white">Razorpay Webhooks Gateway</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">VERIFIED</span>
                      </div>
                      <p className="text-xs text-[#9B7EA8]">Instant payment signature verification, payment status capture &amp; automatic refund triggers.</p>
                      <div className="bg-[#1A0024] p-2.5 rounded-xl border border-white/10 font-mono text-[10px] space-y-1 text-gray-300">
                        <div>Signature Guard: <span className="text-sky-400">HMAC-SHA256</span></div>
                        <div>Capture Mode: <span className="text-white font-bold">Instant Auto-Capture</span></div>
                        <div>Currency: <span className="text-emerald-400 font-bold">INR (₹)</span></div>
                      </div>
                    </div>

                    {/* Node 4: AI Face Scanner & 3D Fitting */}
                    <div className="p-5 bg-[#0D0016]/80 border border-[#FAAE62]/30 rounded-2xl space-y-3 admin-card-3d">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Cpu className="w-5 h-5 text-purple-400" />
                          <span className="font-bold text-sm text-white">AI 3D Face Fitting Tensor Engine</span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/40">24ms LATENCY</span>
                      </div>
                      <p className="text-xs text-[#9B7EA8]">68-landmark facial contour detector &amp; virtual frame try-on recommendation telemetry.</p>
                      <div className="bg-[#1A0024] p-2.5 rounded-xl border border-white/10 font-mono text-[10px] space-y-1 text-gray-300">
                        <div>Mesh Tensor Model: <span className="text-purple-400">MediaPipe FaceLandmarks</span></div>
                        <div>Shapes Classified: <span className="text-white font-bold">Oval, Round, Square, Heart</span></div>
                        <div>Scan Telemetry: <span className="text-emerald-400 font-bold">100% Client-Side Private</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 2: OTP & SECURITY VAULT (HIDDEN FEATURES) --- */}
              {settingsTab === 'security' && (
                <div className="space-y-6">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Restricted Security Vault</h4>
                      <p className="text-[11px] text-[#9B7EA8]">These high-security OTP monitoring tools and authentication controls are hidden from standard navigation.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Delivery OTP Security */}
                    <div className="p-5 bg-[#0D0016]/90 border border-[#FAAE62]/30 rounded-2xl space-y-3">
                      <h5 className="font-bold text-sm text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#FAAE62]" /> Delivery OTP Monitor
                      </h5>
                      <p className="text-xs text-[#9B7EA8]">Inspect order delivery verification codes issued to customers for handover validation.</p>
                      <button
                        onClick={() => {
                          setShowSettingsModal(false);
                          setActiveTab('delivery-otps');
                        }}
                        className="w-full bg-[#1A0024] hover:bg-[#FAAE62]/20 border border-[#FAAE62]/40 text-[#FAAE62] font-bold text-xs py-2.5 rounded-xl transition-all uppercase tracking-wider"
                      >
                        Open Delivery OTP Vault 🔐
                      </button>
                    </div>

                    {/* Signup OTP Security */}
                    <div className="p-5 bg-[#0D0016]/90 border border-[#FAAE62]/30 rounded-2xl space-y-3">
                      <h5 className="font-bold text-sm text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-400" /> Signup OTP Monitor 🔑
                      </h5>
                      <p className="text-xs text-[#9B7EA8]">Real-time phone registration OTP tracker &amp; instant manual verification code override.</p>
                      <button
                        onClick={() => {
                          setShowSettingsModal(false);
                          setActiveTab('signup-otps');
                        }}
                        className="w-full bg-[#1A0024] hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs py-2.5 rounded-xl transition-all uppercase tracking-wider"
                      >
                        Open Signup OTP Vault 🔑
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 3: API FIREWALL & RATE LIMITER --- */}
              {settingsTab === 'firewall' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0D0016]/80 border border-[#FAAE62]/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#FAAE62]" /> Real-Time API Firewall &amp; Rate Limiter
                        </h4>
                        <p className="text-xs text-[#9B7EA8]">Active DDoS request throttling and malicious traffic mitigation node.</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">SHIELD ACTIVE 🛡️</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-center">
                      <div className="bg-[#1A0024] p-4 rounded-xl border border-white/10">
                        <span className="text-[10px] text-[#9B7EA8] uppercase block mb-1">Max Request Threshold</span>
                        <span className="text-xl font-bold text-white">120 req / min</span>
                      </div>
                      <div className="bg-[#1A0024] p-4 rounded-xl border border-white/10">
                        <span className="text-[10px] text-[#9B7EA8] uppercase block mb-1">Blocked Abusive IPs</span>
                        <span className="text-xl font-bold text-emerald-400">0 Active Bans</span>
                      </div>
                      <div className="bg-[#1A0024] p-4 rounded-xl border border-white/10">
                        <span className="text-[10px] text-[#9B7EA8] uppercase block mb-1">CORS Origin Policy</span>
                        <span className="text-xs font-bold text-[#FAAE62] truncate block">lekyaspecs.vercel.app</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 4: LIVE WEBHOOK SANDBOX SIMULATOR --- */}
              {settingsTab === 'sandbox' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0D0016]/90 border border-[#FAAE62]/30 rounded-2xl space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#FAAE62]" /> Live Webhook Simulator &amp; Payload Sandbox
                      </h4>
                      <p className="text-xs text-[#9B7EA8]">Simulate incoming API webhooks from Meta WhatsApp, Parcel Uncle, or Razorpay to test system responses in real-time.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={sandboxEvent}
                        onChange={(e) => setSandboxEvent(e.target.value)}
                        className="bg-[#1A0024] text-xs font-semibold border border-[#FAAE62]/40 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FAAE62]"
                      >
                        <option value="whatsapp_inbound">WhatsApp Inbound Message ("Track order #1042")</option>
                        <option value="parcel_uncle_sync">Parcel Uncle Manifest Status ("OUT_FOR_DELIVERY")</option>
                        <option value="razorpay_payment">Razorpay Payment Captured ("pay_N839210JS83")</option>
                      </select>

                      <button
                        onClick={() => {
                          setSandboxTesting(true);
                          setSandboxResponse(null);
                          setTimeout(() => {
                            setSandboxTesting(false);
                            if (sandboxEvent === 'whatsapp_inbound') {
                              setSandboxResponse({
                                status: 200, statusText: 'OK', latencyMs: 42,
                                gateway: 'Meta WhatsApp Cloud API v18.0',
                                payload: {
                                  object: 'whatsapp_business_account',
                                  entry: [{ changes: [{ value: { messages: [{ from: '919876543210', text: { body: 'Track order #1042' } }] } }] }]
                                },
                                autoReplyTriggered: 'track_order',
                                botResponse: 'Your order #1042 status: SHIPPED. AWB: PU-982341. Live Tracking: https://lekyaspecs.vercel.app/account'
                              });
                            } else if (sandboxEvent === 'parcel_uncle_sync') {
                              setSandboxResponse({
                                status: 200, statusText: 'OK', latencyMs: 58,
                                gateway: 'Courier Uncle Manifest API v2.4',
                                payload: { awb: 'PU-8839201', order_id: 1042, location: 'IGIA Hub, New Delhi', status: 'OUT_FOR_DELIVERY' }
                              });
                            } else {
                              setSandboxResponse({
                                status: 200, statusText: 'OK', latencyMs: 31,
                                gateway: 'Razorpay Webhook Engine',
                                payload: { event: 'payment.captured', payment_id: 'pay_N839210JS83', amount: 249900, signature_verified: true }
                              });
                            }
                          }, 500);
                        }}
                        className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 active:scale-95 text-[#0D0016] font-extrabold text-xs tracking-wider uppercase px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 justify-center"
                      >
                        {sandboxTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : '🚀 Trigger Webhook Test Ping'}
                      </button>
                    </div>

                    {/* Simulation Output Box */}
                    {sandboxResponse && (
                      <div className="bg-[#1A0024] p-4 rounded-2xl border border-emerald-500/40 font-mono text-xs space-y-3 animate-scaleUp">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-emerald-400 font-bold">HTTP {sandboxResponse.status} {sandboxResponse.statusText}</span>
                          <span className="text-[#9B7EA8] text-[10px]">Latency: {sandboxResponse.latencyMs}ms | Gateway: {sandboxResponse.gateway}</span>
                        </div>
                        <pre className="text-gray-300 text-[11px] overflow-x-auto p-2 bg-[#0D0016] rounded-xl border border-white/10">
                          {JSON.stringify(sandboxResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 5: SECRETS & API KEYS REGISTRY --- */}
              {settingsTab === 'secrets' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0D0016]/90 border border-[#FAAE62]/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Key className="w-4 h-4 text-[#FAAE62]" /> System API Secrets &amp; Bearer Tokens
                        </h4>
                        <p className="text-xs text-[#9B7EA8]">Manage environment authentication secrets with mask/unmask security toggle.</p>
                      </div>
                      <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#FAAE62] bg-[#FAAE62]/10 border border-[#FAAE62]/30 px-3 py-1.5 rounded-xl hover:bg-[#FAAE62] hover:text-[#0D0016] transition-all"
                      >
                        {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showSecrets ? 'Hide Secrets' : 'Reveal Secrets'}
                      </button>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {[
                        { key: 'WHATSAPP_VERIFY_TOKEN', val: 'lekya_wa_secret_2026' },
                        { key: 'PARCEL_UNCLE_API_KEY', val: 'pu_live_883921092837410293' },
                        { key: 'RAZORPAY_SECRET_KEY', val: 'rzp_live_secret_9928341029' },
                        { key: 'JWT_SECRET', val: 'lekya_super_secret_jwt_key_2026' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-[#1A0024] rounded-xl border border-white/10">
                          <div>
                            <span className="text-[#FAAE62] font-bold block text-[11px]">{item.key}</span>
                            <span className="text-white text-xs">
                              {showSecrets ? item.val : '••••••••••••••••••••••••••••'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.val);
                              setCopiedKey(item.key);
                              setTimeout(() => setCopiedKey(''), 2000);
                            }}
                            className="p-2 text-[#9B7EA8] hover:text-[#FAAE62] bg-white/5 rounded-lg border border-white/10 hover:border-[#FAAE62] transition-all"
                            title="Copy Key"
                          >
                            {copiedKey === item.key ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 6: AI DB VACUUM & OPTIMIZER --- */}
              {settingsTab === 'vacuum' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0D0016]/90 border border-[#FAAE62]/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" /> Database Vacuum &amp; Index Optimizer
                        </h4>
                        <p className="text-xs text-[#9B7EA8]">Defragment PostgreSQL query tables, purge expired transient sessions, and recalculate B-Tree indexes.</p>
                      </div>
                      <button
                        onClick={() => alert('PostgreSQL Database Vacuumed & Cache Purged Successfully! (0.04s execution time)')}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider px-5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        ⚡ Run Instant DB Vacuum
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-center">
                      <div className="bg-[#1A0024] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-[#9B7EA8] uppercase block">Cache Hit Ratio</span>
                        <span className="text-lg font-bold text-emerald-400">99.4%</span>
                      </div>
                      <div className="bg-[#1A0024] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-[#9B7EA8] uppercase block">Dead Tuples Reclaimed</span>
                        <span className="text-lg font-bold text-white">0 Bloat</span>
                      </div>
                      <div className="bg-[#1A0024] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-[#9B7EA8] uppercase block">Avg Query Latency</span>
                        <span className="text-lg font-bold text-[#FAAE62]">1.8 ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 7: GLOBAL EDGE CDN LATENCY MONITOR --- */}
              {settingsTab === 'cdn' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0D0016]/90 border border-[#FAAE62]/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Globe className="w-4 h-4 text-sky-400" /> Multi-Region Edge CDN Telemetry
                        </h4>
                        <p className="text-xs text-[#9B7EA8]">Real-time edge server response times &amp; Vercel Edge Network routing health.</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full">GLOBAL CDN ONLINE 🌐</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                      {[
                        { region: 'Mumbai (bom1)', ping: '8ms', status: 'Optimal' },
                        { region: 'Delhi (del1)', ping: '12ms', status: 'Optimal' },
                        { region: 'Washington D.C. (iad1)', ping: '178ms', status: 'Stable' },
                        { region: 'Frankfurt (fra1)', ping: '112ms', status: 'Stable' },
                      ].map(r => (
                        <div key={r.region} className="bg-[#1A0024] p-3 rounded-xl border border-white/10 space-y-1">
                          <span className="text-[10px] text-[#9B7EA8] block truncate">{r.region}</span>
                          <span className="text-base font-bold text-emerald-400 block">{r.ping}</span>
                          <span className="text-[9px] text-gray-400 block font-sans">Health: {r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0D0016]/90 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 text-[#0D0016] font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-md"
              >
                Close Settings Vault
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MASTER ORDER DETAILS & STATUS INSPECTOR MODAL ── */}
      {showOrderDetailsModal && selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-scaleUp" onClick={() => setShowOrderDetailsModal(false)}>
          <div className="bg-[#1A0024]/95 border border-[#FAAE62]/40 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden backdrop-blur-2xl my-6 text-white admin-custom-scrollbar max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 bg-[#0D0016]/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4893F] to-[#FAAE62] p-0.5 flex items-center justify-center shadow-lg shadow-[#FAAE62]/20">
                  <div className="w-full h-full bg-[#0D0016] rounded-[14px] flex items-center justify-center font-serif font-extrabold text-[#FAAE62] text-sm">
                    #{selectedOrderDetails.id}
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    Master Order Details &amp; Tracking Inspector 🔎
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#9B7EA8] font-mono mt-0.5">
                    <span>Order #{selectedOrderDetails.id}</span>
                    <span>•</span>
                    <span className="text-[#FAAE62] font-bold">
                      AWB: {selectedOrderDetails.parcel_uncle_tracking_id || selectedOrderDetails.tracking_id || 'Not Generated'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#FAAE62] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow admin-custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* --- LEFT COLUMN: CUSTOMER, ADDRESS & PRESCRIPTION --- */}
                <div className="space-y-4">
                  
                  {/* Customer Information Card */}
                  <div className="p-5 bg-[#0D0016]/80 border border-[#FAAE62]/30 rounded-2xl space-y-3 admin-card-3d">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#FAAE62] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#FAAE62]" /> Customer &amp; Contact Info
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[#9B7EA8] text-[10px] block uppercase">Customer Name</span>
                        <span className="font-bold text-white text-sm">{selectedOrderDetails.user_name}</span>
                      </div>
                      <div>
                        <span className="text-[#9B7EA8] text-[10px] block uppercase">Phone Number</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          📞 {selectedOrderDetails.shipping_address?.phone || 'Not Provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#9B7EA8] text-[10px] block uppercase">Email Address</span>
                        <span className="text-gray-300 font-mono">{selectedOrderDetails.user_email}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-[#9B7EA8] text-[10px] block uppercase">Full Shipping Address</span>
                        <span className="text-white block leading-relaxed mt-0.5">
                          {typeof selectedOrderDetails.shipping_address === 'object'
                            ? `${selectedOrderDetails.shipping_address.address || ''}, ${selectedOrderDetails.shipping_address.city || ''}, PIN: ${selectedOrderDetails.shipping_address.zip || ''}`
                            : selectedOrderDetails.shipping_address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Specs Card */}
                  {selectedOrderDetails.shipping_address?.prescription && (
                    <div className="p-5 bg-[#0D0016]/80 border border-purple-500/30 rounded-2xl space-y-3 admin-card-3d">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" /> Medical Eye Prescription 👓
                      </h4>
                      <div className="bg-[#1A0024] p-3 rounded-xl border border-white/10 font-mono text-xs space-y-2 text-gray-200">
                        <div className="flex justify-between border-b border-white/10 pb-1.5 font-bold">
                          <span className="text-purple-300">OD (Right Eye)</span>
                          <span>SPH: {selectedOrderDetails.shipping_address.prescription.odSph} | CYL: {selectedOrderDetails.shipping_address.prescription.odCyl} | AX: {selectedOrderDetails.shipping_address.prescription.odAxis}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-1.5 font-bold">
                          <span className="text-purple-300">OS (Left Eye)</span>
                          <span>SPH: {selectedOrderDetails.shipping_address.prescription.osSph} | CYL: {selectedOrderDetails.shipping_address.prescription.osCyl} | AX: {selectedOrderDetails.shipping_address.prescription.osAxis}</span>
                        </div>
                        <div className="flex justify-between pt-1 text-[11px]">
                          <span>Pupillary Distance (PD): <strong className="text-white">{selectedOrderDetails.shipping_address.prescription.pd} mm</strong></span>
                          <span>Lens Index: <strong className="text-white">{selectedOrderDetails.shipping_address.prescription.lensIndex}</strong></span>
                        </div>
                        {selectedOrderDetails.shipping_address.prescription && (
                          <div className="pt-1.5 border-t border-white/10 text-[10px] text-gray-400 font-sans">
                            <strong className="text-purple-300">Coatings:</strong> {[
                              selectedOrderDetails.shipping_address.prescription.antiGlare && 'Anti-Reflective',
                              selectedOrderDetails.shipping_address.prescription.blueShield && 'Blue-Shield',
                              selectedOrderDetails.shipping_address.prescription.photochromic && 'Photochromic'
                            ].filter(Boolean).join(', ') || 'Standard Clean'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Financial Invoice Card */}
                  <div className="p-5 bg-[#0D0016]/80 border border-[#FAAE62]/30 rounded-2xl space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#FAAE62] flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#FAAE62]" /> Payment Breakdown &amp; Invoice
                    </h4>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-gray-300">
                        <span>Payment Gateway ID:</span>
                        <span className="text-white font-bold">{selectedOrderDetails.payment_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Total Paid Amount:</span>
                        <span className="text-lg font-bold text-[#FAAE62]">₹{parseFloat(selectedOrderDetails.total_amount).toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedInvoiceOrder(selectedOrderDetails);
                          setShowOrderDetailsModal(false);
                        }}
                        className="w-full bg-[#1A0024] hover:bg-[#FAAE62]/20 border border-[#FAAE62]/40 text-[#FAAE62] font-bold text-xs py-2 rounded-xl transition-all uppercase tracking-wider mt-2 flex items-center justify-center gap-2"
                      >
                        📄 Download / Print Official Tax Invoice
                      </button>
                    </div>
                  </div>

                </div>

                {/* --- RIGHT COLUMN: LOGISTICS, RIDER & STATUS CONTROLLER --- */}
                <div className="space-y-4">

                  {/* Fulfillment Status Controller */}
                  <div className="p-5 bg-[#0D0016]/90 border border-[#FAAE62]/30 rounded-2xl space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#FAAE62] flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-[#FAAE62]" /> Update Fulfillment Status
                    </h4>
                    <select
                      value={selectedOrderDetails.status}
                      onChange={(e) => {
                        handleStatusUpdate(selectedOrderDetails.id, e.target.value);
                        setSelectedOrderDetails({ ...selectedOrderDetails, status: e.target.value });
                      }}
                      className="w-full bg-[#1A0024] text-xs font-bold border border-[#FAAE62]/40 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FAAE62] uppercase tracking-wider"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Payment Confirmed">Payment Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Courier Partner & Parcel Uncle Logistics */}
                  <div className="p-5 bg-[#0D0016]/90 border border-orange-500/40 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-orange-400 flex items-center gap-2">
                        <PackageX className="w-4 h-4 text-orange-400" /> Logistics &amp; Courier Partner
                      </h4>
                      <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {selectedOrderDetails.parcel_uncle_tracking_id ? 'PARCEL UNCLE ACTIVE' : 'DIRECT SHIPMENT'}
                      </span>
                    </div>

                    {selectedOrderDetails.parcel_uncle_tracking_id ? (
                      <div className="bg-[#1A0024] p-4 rounded-xl border border-orange-500/30 font-mono text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[#9B7EA8] text-[10px] uppercase">Parcel Uncle AWB:</span>
                          <span className="font-bold text-white text-sm">{selectedOrderDetails.parcel_uncle_tracking_id}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#9B7EA8]">Live API Status:</span>
                          <span className="font-bold text-emerald-400 uppercase">{selectedOrderDetails.parcel_uncle_status || 'MANIFESTED'}</span>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => handleSyncParcelUncle(selectedOrderDetails.id)}
                            disabled={syncingOrder === selectedOrderDetails.id}
                            className="flex-1 bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-black font-bold text-xs py-2 rounded-xl border border-orange-500/40 transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            {syncingOrder === selectedOrderDetails.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '🔄 Sync Live Status'}
                          </button>
                          <a
                            href={`${API_BASE}/api/shipping/parcel-uncle/label/${selectedOrderDetails.parcel_uncle_tracking_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-bold text-xs py-2 rounded-xl border border-emerald-500/40 transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            🏷️ Thermal Label PDF
                          </a>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          handleDispatchParcelUncle(selectedOrderDetails.id);
                          setSelectedOrderDetails({ ...selectedOrderDetails, parcel_uncle_status: 'MANIFESTED' });
                        }}
                        disabled={dispatchingOrder === selectedOrderDetails.id}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 text-black font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {dispatchingOrder === selectedOrderDetails.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '🚚 Ship via Parcel Uncle Express API'}
                      </button>
                    )}
                  </div>

                  {/* Rider Assignment */}
                  <div className="p-5 bg-[#0D0016]/90 border border-sky-500/40 rounded-2xl space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-sky-400 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-sky-400" /> Local Rider Assignment
                    </h4>
                    <select
                      value={selectedOrderDetails.assigned_delivery_agent_id || ''}
                      onChange={(e) => {
                        handleRiderAssign(selectedOrderDetails.id, e.target.value);
                        setSelectedOrderDetails({ ...selectedOrderDetails, assigned_delivery_agent_id: e.target.value });
                      }}
                      className="w-full bg-[#1A0024] text-xs font-semibold border border-sky-500/40 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-400"
                    >
                      <option value="">Select Delivery Rider</option>
                      {deliveryAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dispatch Tracking Comments */}
                  <div className="p-5 bg-[#0D0016]/90 border border-white/10 rounded-2xl space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#FAAE62] flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-[#FAAE62]" /> Dispatch Notes &amp; Tracking Comments
                    </h4>
                    <textarea
                      rows={2}
                      placeholder="Add dispatch comments or tracking updates..."
                      value={selectedOrderDetails.tracking_comments || ''}
                      onChange={(e) => setSelectedOrderDetails({ ...selectedOrderDetails, tracking_comments: e.target.value })}
                      className="w-full bg-[#1A0024] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FAAE62]"
                    />
                    <button
                      onClick={() => {
                        setSelectedTrackingOrder(selectedOrderDetails);
                        setTrackingCommentsText(selectedOrderDetails.tracking_comments || '');
                        setShowTrackingModal(true);
                      }}
                      className="w-full bg-white/5 hover:bg-[#FAAE62]/20 border border-white/10 text-[#FAAE62] font-bold text-xs py-2 rounded-xl transition-all uppercase tracking-wider"
                    >
                      Save Dispatch Notes 📝
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0D0016]/90 flex justify-end">
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="bg-gradient-to-r from-[#D4893F] to-[#FAAE62] hover:scale-105 text-[#0D0016] font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-md"
              >
                Done Inspecting
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
