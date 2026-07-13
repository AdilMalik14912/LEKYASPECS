const React = require('react');
const { useState, useEffect } = React;
const Link = require('next/link').default;
const { useRouter } = require('next/router');
const { useAuth } = require('./_app');
const { 
  BarChart3, ShoppingBag, ClipboardList, Users, ShieldCheck, 
  Trash2, Edit, Plus, Star, Landmark, ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle, Loader2, Sliders,
  Tag, Mail, ScrollText, Download, HelpCircle, Activity, X, Sparkles
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
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const yVal = minSales + ((maxSales - minSales) * i) / yTicks;
      const yPos = margin.top + chartHeight - (i * chartHeight) / yTicks;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, yPos);
      ctx.lineTo(margin.left + chartWidth, yPos);
      ctx.stroke();

      ctx.fillStyle = '#777';
      ctx.font = '10px monospace';
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
    gradient.addColorStop(0, 'rgba(197, 160, 40, 0.25)');
    gradient.addColorStop(1, 'rgba(197, 160, 40, 0.01)');
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
    ctx.strokeStyle = '#C5A028';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw dots and X date labels
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#C5A028';
      ctx.lineWidth = 2.5;
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
  const { user, token, authLoading } = useAuth();

  // Active dashboard tabs: 'stats', 'products', 'orders', 'customers'
  const [activeTab, setActiveTab] = useState('stats');

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

  // Order Filtering State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

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

  // Security gate: redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || !(user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com')) {
        router.push('/account');
      }
    }
  }, [user, authLoading]);

  // Fetch data depending on active tab
  useEffect(() => {
    if (!token || !user || !(user.role === 'admin' || user.email === 'dev.parceluncle@gmail.com' || user.email === 'admin@specs.com')) return;

    if (activeTab === 'stats') {
      setAnalyticsLoading(true);
      fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setAnalytics(data); setAnalyticsLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'products') {
      setProductsLoading(true);
      fetch(`${API_BASE}/api/products`)
        .then(res => res.json())
        .then(data => { setProducts(data); setProductsLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'orders') {
      setOrdersLoading(true);
      fetch(`${API_BASE}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setOrders(data); setOrdersLoading(false); })
        .catch(err => console.error(err));

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
        .then(res => res.json())
        .then(data => { setAdmins(data); setAdminsLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'coupons') {
      setCouponsLoading(true);
      fetch(`${API_BASE}/api/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setCoupons(data); setCouponsLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'logs') {
      setLogsLoading(true);
      fetch(`${API_BASE}/api/admin/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setLogs(data); setLogsLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'helpdesk') {
      setContactMessagesLoading(true);
      fetch(`${API_BASE}/api/admin/helpdesk`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setContactMessages(data); setContactMessagesLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'db') {
      setDbHealthLoading(true);
      fetch(`${API_BASE}/api/admin/db/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setDbHealth(data); setDbHealthLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'sessions') {
      setActiveSessionsLoading(true);
      fetch(`${API_BASE}/api/admin/active-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setActiveSessionsData(data); setActiveSessionsLoading(false); })
        .catch(err => console.error(err));
    } else if (activeTab === 'team') {
      setTeamLoading(true);
      fetch(`${API_BASE}/api/admin/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setTeamUsers(data || []); setTeamLoading(false); })
        .catch(err => { console.error(err); setTeamLoading(false); });
    } else if (activeTab === 'delivery-otps') {
      setDeliveryOtpsLoading(true);
      fetch(`${API_BASE}/api/admin/delivery-otps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setDeliveryOtps(data || []); setDeliveryOtpsLoading(false); })
        .catch(err => { console.error(err); setDeliveryOtpsLoading(false); });
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
    <div className="bg-premium-light min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar Controls */}
      <aside className="w-full md:w-64 bg-premium-black text-white p-6 shrink-0 flex flex-col border-r border-premium-accent/20">
        <div className="mb-10 text-center sm:text-left">
          <Link href="/" className="font-serif text-2xl font-bold tracking-widest text-premium-accent">
            LEKYA SPECS ADMIN
          </Link>
          <span className="block text-[10px] text-gray-500 uppercase tracking-widest mt-1">Management Portal</span>
        </div>

        <nav className="space-y-2 flex-grow uppercase text-xs tracking-wider font-semibold">
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'stats' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'products' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Manage Products
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'orders' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Customer Orders
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'customers' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> View Customers
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'admins' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Manage Admins
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'coupons' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tag className="w-4 h-4" /> Promo Codes
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'broadcast' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" /> Email Broadcast
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'logs' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ScrollText className="w-4 h-4" /> Activity Log
          </button>

          <button
            onClick={() => setActiveTab('helpdesk')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'helpdesk' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Support Helpdesk
          </button>

          <button
            onClick={() => setActiveTab('db')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'db' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" /> DB Optimizer
          </button>

          <button
            onClick={() => setActiveTab('customizer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'customizer' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" /> Store Customizer (CMS)
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'sessions' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> Live User Monitor
          </button>

          <Link
            href="/stylist"
            className="w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left text-premium-accent hover:text-white hover:bg-white/5 font-semibold text-xs tracking-wider"
            style={{ textDecoration: 'none' }}
          >
            <Sparkles className="w-4 h-4" /> Brand Stylist Hub 🎨
          </Link>

          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'team' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> Team Management
          </button>

          <button
            onClick={() => setActiveTab('delivery-otps')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
              activeTab === 'delivery-otps' ? 'bg-premium-accent text-premium-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Delivery OTP Monitor
          </button>

          <Link
            href="/admin-map"
            className="w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left text-blue-400 hover:text-white hover:bg-white/5 font-semibold text-xs tracking-wider"
            style={{ textDecoration: 'none' }}
          >
            🛰 Live Rider Map
          </Link>

          <Link
            href="/chat"
            className="w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left text-yellow-400 hover:text-white hover:bg-white/5 font-semibold text-xs tracking-wider"
            style={{ textDecoration: 'none' }}
          >
            💬 Team Chat
          </Link>
        </nav>

        <div className="border-t border-gray-800 pt-6 mt-10 flex items-center gap-2 text-[10px] text-premium-accent">
          <ShieldCheck className="w-4 h-4" /> Root Authorization
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-6 sm:p-10 max-w-7xl overflow-x-hidden">
        
        {/* --- TAB 1: ANALYTICS OVERVIEW --- */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-8 border-b border-premium-border pb-4">
              Dashboard Analytics
            </h2>

            {analyticsLoading ? (
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
                    className="flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-left transition-all group"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-amber-700 tracking-wider">Pending Orders</span>
                      <span className="text-2xl font-extrabold text-amber-900">{analytics.metrics.pending_orders}</span>
                    </div>
                    <ClipboardList className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
                  </button>

                  <button 
                    onClick={() => {
                      setProductSearch('');
                      setActiveTab('products');
                    }}
                    className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-left transition-all group"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-red-700 tracking-wider">Out of Stock</span>
                      <span className="text-2xl font-extrabold text-red-900">{analytics.metrics.out_of_stock}</span>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
                  </button>

                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded text-left">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-green-700 tracking-wider">Today's Revenue</span>
                      <span className="text-2xl font-extrabold text-green-900">₹{analytics.metrics.today_sales.toLocaleString('en-IN')}</span>
                    </div>
                    <Landmark className="w-8 h-8 text-green-400" />
                  </div>

                  <button 
                    onClick={() => {
                      setCustomerSearch('');
                      setActiveTab('customers');
                    }}
                    className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-left transition-all group"
                  >
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-blue-700 tracking-wider">New Users Today</span>
                      <span className="text-2xl font-extrabold text-blue-900">{analytics.metrics.new_customers_today}</span>
                    </div>
                    <Users className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <span className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Total Sales Revenue</span>
                    <span className="text-3xl font-bold text-premium-black">₹{analytics.metrics.total_sales.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <span className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Paid Orders</span>
                    <span className="text-3xl font-bold text-premium-black">{analytics.metrics.total_orders}</span>
                  </div>
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <span className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">Registered Customers</span>
                    <span className="text-3xl font-bold text-premium-black">{analytics.metrics.total_customers}</span>
                  </div>
                </div>

                {/* 7-Day Revenue Line Chart */}
                <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-bold text-premium-black">7-Day Sales Trend</h3>
                    <span className="text-xs text-premium-gray font-semibold">Live Transaction Activity</span>
                  </div>
                  <RevenueChart data={analytics.sales_trend} />
                </div>

                {/* Grid for top selling & low stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Selling Products */}
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <h3 className="font-serif text-lg font-bold text-premium-black mb-4">Top 5 Best Sellers</h3>
                    <div className="divide-y divide-premium-border">
                      {analytics.top_products.map((item, idx) => (
                        <div key={item.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xs text-premium-accent w-4">{idx + 1}</span>
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded border border-premium-border" />
                            <div>
                              <span className="font-semibold text-sm text-premium-dark block truncate max-w-[150px]">{item.name}</span>
                              <span className="text-[10px] text-premium-gray uppercase font-semibold">{item.frame_shape} shape</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm block">₹{parseFloat(item.revenue).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-premium-gray block">{item.units_sold} units sold</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low Stock Warnings */}
                  <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                    <h3 className="font-serif text-lg font-bold text-premium-black mb-4 text-red-600 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600" /> Low Stock Alerts
                    </h3>
                    {analytics.low_stock_alerts.length === 0 ? (
                      <p className="text-sm text-premium-gray py-4 text-center">All product inventory columns healthy.</p>
                    ) : (
                      <div className="divide-y divide-premium-border">
                        {analytics.low_stock_alerts.map(item => (
                          <div key={item.id} className="py-3 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-sm text-premium-dark block">{item.name}</span>
                              <span className="text-xs text-premium-gray">Price: ₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                            </div>
                            <span className={`font-bold px-3 py-1 rounded text-xs ${
                              item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
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
                <div className="bg-white border border-premium-border rounded p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-premium-black mb-4">Category Distribution</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {analytics.category_distribution.map(cat => (
                      <div key={cat.category} className="p-4 bg-premium-light border border-premium-border rounded">
                        <span className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-1">{cat.category}</span>
                        <span className="text-xl font-bold text-premium-black">₹{parseFloat(cat.revenue).toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-premium-accent uppercase font-bold mt-1">{cat.items_sold} sold</span>
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
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-premium-border pb-4">
              <h2 className="font-serif text-3xl font-bold text-premium-black">
                Manage Inventory
              </h2>
              <button
                onClick={openAddModal}
                className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3.5 rounded transition-all flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add Eyewear Frame
              </button>
            </div>

            {productsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                {/* Product Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-5 items-center">
                  <input
                    type="text"
                    placeholder="Search products by name, category, shape..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full sm:w-96 bg-white border border-premium-border rounded p-2.5 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <span className="text-xs text-premium-gray font-semibold">{products.filter(p =>
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.frame_shape.toLowerCase().includes(productSearch.toLowerCase())
                  ).length} of {products.length} products</span>
                </div>

                <div className="bg-white border border-premium-border rounded overflow-x-auto shadow-sm">
                  <table className="min-w-full divide-y divide-premium-border text-left">
                    <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
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
                    <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
                      {products.filter(p =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.frame_shape.toLowerCase().includes(productSearch.toLowerCase())
                      ).map(prod => (
                        <tr key={prod.id} className="hover:bg-premium-light/50">
                          <td className="px-6 py-4 text-xs font-bold text-premium-accent">#{prod.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={prod.image_urls[0]} alt={prod.name} className="w-10 h-10 object-cover rounded border border-premium-border" />
                              <span className="font-semibold block truncate max-w-[180px]">{prod.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs">{prod.gender} • {prod.category}</td>
                          <td className="px-6 py-4">{prod.frame_shape}</td>
                          <td className="px-6 py-4 font-bold">₹{parseFloat(prod.price).toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                              prod.stock === 0 ? 'bg-red-100 text-red-700' :
                              prod.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {prod.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-3">
                              <button onClick={() => openEditModal(prod)} className="p-1.5 text-premium-gray hover:text-premium-accent transition-colors" title="Edit Frame">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-premium-gray hover:text-red-600 transition-colors" title="Delete Frame">
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
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-premium-border pb-4">
              <h2 className="font-serif text-3xl font-bold text-premium-black">
                Customer Orders
              </h2>
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
                className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3.5 rounded transition-all flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" /> Export to CSV
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search orders (ID, Name, Email)..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full sm:w-80 bg-white border border-premium-border rounded p-2.5 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <label className="text-xs uppercase tracking-wider text-premium-gray font-semibold">Filter Status</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-white text-xs border border-premium-border rounded px-3 py-2 focus:outline-none focus:border-premium-accent font-bold uppercase tracking-wider text-premium-dark"
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
                </div>

                {orders.filter(order => {
                  const matchesSearch = 
                    order.user_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    order.user_email.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    order.id.toString().includes(orderSearch);
                    
                  const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
                  
                  return matchesSearch && matchesStatus;
                }).length === 0 ? (
                  <p className="text-center py-10 bg-white border rounded text-premium-gray">No customer orders matching the filter.</p>
                ) : (
                  <div className="bg-white border border-premium-border rounded overflow-x-auto shadow-sm">
                    <table className="min-w-full divide-y divide-premium-border text-left">
                      <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
                        <tr>
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Payment ID</th>
                          <th className="px-6 py-4">Shipping Info</th>
                          <th className="px-6 py-4">Tracking Info</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Total Amount</th>
                          <th className="px-6 py-4">Fulfillment Status</th>
                          <th className="px-6 py-4">Delivery Rider</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
                        {orders.filter(order => {
                          const matchesSearch = 
                            order.user_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            order.user_email.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            order.id.toString().includes(orderSearch);
                            
                          const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
                          
                          return matchesSearch && matchesStatus;
                        }).map(order => (
                          <tr key={order.id} className="hover:bg-premium-light/50">
                            <td className="px-6 py-4 text-xs">
                              <span className="font-bold text-premium-accent block">#{order.id}</span>
                              {order.tracking_id && (
                                <span className="font-mono text-gray-500 block text-[9px] mt-0.5 tracking-wider font-bold">
                                  {order.tracking_id}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <span className="font-semibold block">{order.user_name}</span>
                                <span className="text-[10px] text-premium-gray block mt-0.5">{order.user_email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono">{order.payment_id || 'N/A'}</td>
                            <td className="px-6 py-4 text-xs">
                              <div>
                                <span className="font-semibold block">{order.shipping_address.address}, {order.shipping_address.city}</span>
                                <span className="text-premium-gray block text-[10px] mt-0.5">PIN {order.shipping_address.zip} | Phone: {order.shipping_address.phone}</span>
                                {order.shipping_address.prescription && (
                                  <div className="mt-2 bg-premium-accent/10 border border-premium-accent/30 text-premium-black p-2 rounded text-[10px] space-y-1 font-mono max-w-[240px]">
                                    <p className="font-bold uppercase tracking-wider text-[8px] text-premium-golddark">👓 Prescription Applied</p>
                                    <div className="border-t border-premium-accent/20 pt-1 flex justify-between">
                                      <span>OD (R): SPH {order.shipping_address.prescription.odSph}</span>
                                      <span>CYL {order.shipping_address.prescription.odCyl}</span>
                                      <span>AX {order.shipping_address.prescription.odAxis}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>OS (L): SPH {order.shipping_address.prescription.osSph}</span>
                                      <span>CYL {order.shipping_address.prescription.osCyl}</span>
                                      <span>AX {order.shipping_address.prescription.osAxis}</span>
                                    </div>
                                    <div className="border-t border-premium-accent/20 pt-1 flex justify-between">
                                      <span>PD: {order.shipping_address.prescription.pd} mm</span>
                                      <span>Index: {order.shipping_address.prescription.lensIndex}</span>
                                    </div>
                                    <p className="text-[9px] text-premium-gray mt-1 leading-normal font-sans">
                                      <strong>Coatings:</strong> {[
                                        order.shipping_address.prescription.antiGlare && 'Anti-Reflective',
                                        order.shipping_address.prescription.blueShield && 'Blue-Shield',
                                        order.shipping_address.prescription.photochromic && 'Photochromic'
                                      ].filter(Boolean).join(', ') || 'None (Standard)'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {order.tracking_comments ? (
                                <div className="max-w-[200px] text-premium-dark">
                                  <p className="font-semibold truncate" title={order.tracking_comments}>{order.tracking_comments}</p>
                                  <button
                                    onClick={() => {
                                      setSelectedTrackingOrder(order);
                                      setTrackingCommentsText(order.tracking_comments || '');
                                      setShowTrackingModal(true);
                                    }}
                                    className="text-[10px] text-premium-accent hover:underline font-bold mt-1"
                                  >
                                    Update details
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedTrackingOrder(order);
                                    setTrackingCommentsText('');
                                    setShowTrackingModal(true);
                                  }}
                                  className="text-[10px] bg-premium-light border border-premium-border text-premium-dark font-bold hover:bg-premium-accent hover:text-premium-black px-2.5 py-1 rounded transition-colors"
                                >
                                  + Add Dispatch
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 font-bold text-premium-accent">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                className={`bg-premium-light text-xs font-bold border border-premium-border rounded px-2.5 py-1 focus:outline-none focus:border-premium-accent uppercase tracking-wide cursor-pointer ${
                                  order.status === 'Paid' || order.status === 'Payment Confirmed' || order.status === 'Delivered' ? 'text-green-700' :
                                  order.status === 'Processing' || order.status === 'Packed' ? 'text-amber-700' :
                                  order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'text-blue-700' : 'text-gray-700'
                                }`}
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
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.assigned_delivery_agent_id || ''}
                                onChange={(e) => handleRiderAssign(order.id, e.target.value)}
                                className="bg-premium-light text-xs font-semibold border border-premium-border rounded px-2 py-1 focus:outline-none focus:border-premium-accent tracking-wide cursor-pointer text-premium-dark max-w-[150px]"
                              >
                                <option value="">Select Rider</option>
                                {deliveryAgents.map(agent => (
                                  <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                  </option>
                                ))}
                              </select>
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

        {/* --- TAB 4: CUSTOMERS DIRECTORY --- */}
        {activeTab === 'customers' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-premium-border pb-4">
              <h2 className="font-serif text-3xl font-bold text-premium-black">
                Registered Customers
              </h2>
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
                className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3.5 rounded transition-all flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" /> Export to CSV
              </button>
            </div>

            {customersLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                {/* Customer Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search customers (name, email, face shape)..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full sm:w-96 bg-white border border-premium-border rounded p-2.5 text-xs focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <span className="text-xs text-premium-gray font-semibold">
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
                  <p className="text-center py-10 bg-white border rounded text-premium-gray">No customers matching your search.</p>
                ) : (
                  <div className="bg-white border border-premium-border rounded overflow-x-auto shadow-sm">
                    <table className="min-w-full divide-y divide-premium-border text-left">
                      <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
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
                      <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
                        {customers.filter(c =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          (c.phone || '').includes(customerSearch) ||
                          (c.face_shape || '').toLowerCase().includes(customerSearch.toLowerCase())
                        ).map(cust => (
                          <tr key={cust.id} className="hover:bg-premium-light/50">
                            <td className="px-6 py-4 text-xs font-bold text-premium-accent">#{cust.id}</td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleInspectCustomer(cust.id)}
                                className="font-semibold text-premium-black hover:text-premium-accent hover:underline transition-colors text-left"
                              >
                                {cust.name}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-mono text-xs">{cust.email}</div>
                              {cust.phone && <div className="text-[10px] text-premium-gray font-normal mt-0.5">{cust.phone}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] uppercase font-bold tracking-wide ${cust.face_shape ? 'text-premium-golddark font-semibold' : 'text-gray-400'}`}>
                                {cust.face_shape || 'No Scan'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {new Date(cust.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 font-bold text-center sm:text-left">{cust.paid_orders_count}</td>
                            <td className="px-6 py-4 font-bold text-premium-accent">₹{parseFloat(cust.total_spend || 0).toLocaleString('en-IN')}</td>
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
            <h2 className="font-serif text-3xl font-bold text-premium-black mb-2 border-b border-premium-border pb-4">
              Store Content Customizer
            </h2>
            <p className="text-xs text-premium-gray font-light mb-8">
              Modify the homepage hero banners, main headings, subtitles, background slides, and product showcase titles in real time.
            </p>

            {settingsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <form onSubmit={handleSettingsSubmit} className="bg-white border border-premium-border rounded p-6 sm:p-10 shadow-sm space-y-6 max-w-2xl">
                
                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Homepage Hero Title</label>
                  <textarea
                    required
                    rows="3"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Engineered for \n Style & Clarity"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium leading-relaxed"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 font-light">Tip: Type a new line or \n to break the heading line on larger screens.</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Hero Description Subtitle</label>
                  <textarea
                    required
                    rows="4"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Crafted from premium materials..."
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Hero Background Image URL</label>
                  <input
                    type="text"
                    required
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                  <div className="mt-3 relative h-40 w-full bg-premium-light border rounded overflow-hidden">
                    {heroImage && <img src={heroImage} alt="hero preview" className="w-full h-full object-cover" />}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-premium-gray font-semibold mb-2">Showcase Section Title</label>
                  <input
                    type="text"
                    required
                    value={trendingTitle}
                    onChange={(e) => setTrendingTitle(e.target.value)}
                    placeholder="Trending Frames"
                    className="w-full bg-premium-light text-sm border border-premium-border rounded p-3 focus:outline-none focus:border-premium-accent text-premium-dark font-medium"
                  />
                </div>

                {settingsError && (
                  <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 rounded border border-red-200">
                    {settingsError}
                  </div>
                )}

                {settingsSuccess && (
                  <div className="text-green-700 text-xs font-semibold p-3 bg-green-50 rounded border border-green-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {settingsSuccess}
                  </div>
                )}

                <div className="pt-4 border-t border-premium-border">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase py-4 px-10 rounded transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
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
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-premium-border pb-4">
              <h2 className="font-serif text-3xl font-bold text-premium-black">
                Manage Admins
              </h2>
              <button
                onClick={() => {
                  setAdminName('');
                  setAdminEmail('');
                  setAdminPassword('');
                  setAdminError('');
                  setAdminSuccess('');
                  setShowAdminModal(true);
                }}
                className="bg-premium-black text-white hover:bg-premium-accent hover:text-premium-black font-semibold text-xs tracking-widest uppercase px-6 py-3.5 rounded transition-all flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Create New Admin
              </button>
            </div>

            {adminsLoading ? (
              <div className="text-center py-20"><Loader2 className="w-10 h-10 text-premium-accent animate-spin mx-auto" /></div>
            ) : (
              <div>
                <div className="bg-white border border-premium-border rounded overflow-x-auto shadow-sm">
                  <table className="min-w-full divide-y divide-premium-border text-left">
                    <thead className="bg-premium-light text-[10px] uppercase tracking-wider text-premium-gray font-bold">
                      <tr>
                        <th className="px-6 py-4">Admin ID</th>
                        <th className="px-6 py-4">Admin Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Date Created</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-premium-border text-sm font-medium text-premium-dark">
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
                                  <option value="admin">Admin</option>
                                </select>
                              )}
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

    </div>
  );
}
