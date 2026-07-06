const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generates a random 5-character alphanumeric code, avoiding ambiguous characters
function generateRandomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjklmnpqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generates an SVG representation of the code with noise lines and background dots
function generateSvgCaptcha(code) {
  const width = 160;
  const height = 50;

  // Aesthetic dark background matching Lekya Specs look
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: #0a0a0a; border-radius: 8px; border: 1px solid rgba(197, 160, 40, 0.2); box-shadow: inset 0 2px 10px rgba(0,0,0,0.8); user-select: none;">`;

  // Draw some noise circles in the background
  for (let i = 0; i < 20; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = Math.floor(Math.random() * 3) + 1;
    const op = (Math.random() * 0.2 + 0.05).toFixed(2);
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(197, 160, 40, ${op})" />`;
  }

  // Draw random noise lines crossing the text area
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * (width / 4));
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * (width / 2) + (width / 2));
    const y2 = Math.floor(Math.random() * height);
    const op = (Math.random() * 0.3 + 0.15).toFixed(2);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(197, 160, 40, ${op})" stroke-width="${(Math.random() * 1.5 + 1).toFixed(1)}" />`;
  }

  // Render individual letters with rotation, offset, and color variation
  const colors = ['#C5A028', '#e8c547', '#fdfdfd', '#9e9e9e', '#d4870c'];
  const charWidth = Math.floor(width / (code.length + 1.2));

  for (let i = 0; i < code.length; i++) {
    const char = code.charAt(i);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const fontSize = Math.floor(Math.random() * 6) + 22; // 22px to 27px
    const x = Math.floor(charWidth * (i + 0.7)) + Math.floor(Math.random() * 4) - 2;
    const y = Math.floor(height / 2) + 8 + Math.floor(Math.random() * 6) - 3; // Vertically center with offset
    const angle = Math.floor(Math.random() * 40) - 20; // Rotate between -20 and +20 deg

    svg += `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="Courier New, monospace, sans-serif" font-weight="bold" transform="rotate(${angle}, ${x}, ${y})" filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.5))">${char}</text>`;
  }

  svg += `</svg>`;
  return svg;
}

// Generate a new captcha payload containing the token and the SVG string
function getCaptchaPayload() {
  const code = generateRandomCode();
  const svg = generateSvgCaptcha(code);

  const token = jwt.sign(
    { answer: code.toLowerCase() },
    process.env.JWT_SECRET || 'jwt_secret_lekyaspecs_security',
    { expiresIn: '5m' } // Captcha valid for 5 minutes
  );

  return { token, svg };
}

module.exports = {
  getCaptchaPayload,
  verifyCaptchaToken: (token, userInput) => {
    if (!token || !userInput) return false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_lekyaspecs_security');
      return decoded.answer === userInput.trim().toLowerCase();
    } catch (_) {
      return false; // Token expired or invalid
    }
  }
};
