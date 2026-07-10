const { verifyToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Access token missing or invalid' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Token expired or invalid' });
  }

  req.user = decoded;

  // Real-time multi-session tracking in database
  const db = require('../config/db');
  const sessionKey = token.slice(-35); // Use unique signature slice as session key
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ua = req.headers['user-agent'] || 'unknown';

  // Run async insert/update
  db.query(
    `INSERT OR REPLACE INTO active_sessions (user_id, email, phone, session_key, ip_address, user_agent, last_active_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [decoded.id, decoded.email || null, decoded.phone || null, sessionKey, ip, ua]
  ).catch(err => console.error('Session log failed:', err));

  // Periodically clean up old sessions (inactive > 30 minutes)
  db.query(`DELETE FROM active_sessions WHERE last_active_at < datetime('now', '-30 minutes')`)
    .catch(err => console.error('Clean old sessions failed:', err));

  next();

};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (
    req.user.role === 'admin' ||
    req.user.email === 'dev.parceluncle@gmail.com' ||
    req.user.email === 'admin@specs.com'
  ) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access only' });
  }
};

const isSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (
    req.user.role === 'seller' ||
    req.user.role === 'admin' ||
    req.user.email === 'dev.parceluncle@gmail.com' ||
    req.user.email === 'admin@specs.com'
  ) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Seller access only' });
  }
};

const isDelivery = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (
    req.user.role === 'delivery' ||
    req.user.role === 'admin' ||
    req.user.email === 'dev.parceluncle@gmail.com' ||
    req.user.email === 'admin@specs.com'
  ) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Delivery agent access only' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  isSeller,
  isDelivery
};
