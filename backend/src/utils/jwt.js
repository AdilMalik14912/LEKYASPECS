/**
 * jwt.js — centralised JWT helper
 *
 * Usage:
 *   const { signToken, verifyToken } = require('../utils/jwt');
 *
 *   const token = signToken({ id: user.id, email: user.email });
 *   const payload = verifyToken(token); // null if invalid/expired
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

/**
 * Sign a payload and return a JWT token.
 * @param {object} payload  - data to encode (e.g. { id, name, email })
 * @param {string} expiresIn - e.g. '7d', '2h', '30m'
 */
function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload, or null if invalid/expired.
 * @param {string} token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (_) {
    return null;
  }
}

module.exports = { signToken, verifyToken };
