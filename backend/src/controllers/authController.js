const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// ─── JWT Secret ────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'lekya_specs_jwt_secret_key_2024';

// ─── Admin Emails ──────────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['dev.parceluncle@gmail.com', 'admin@specs.com'];

// ─── Helper: Generate JWT Token ────────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── Helper: Is Admin Email ────────────────────────────────────────────────────
function isAdminEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(lower) || lower.includes('parceluncle');
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const identifier = String(email).trim();
    const identifierLower = identifier.toLowerCase();
    const isPhone = /^[\d\s+\-().]{7,15}$/.test(identifier);


    // ── REGULAR USER PATH ────────────────────────────────────────────────────
    let result;
    if (isPhone) {
      result = await db.query('SELECT * FROM users WHERE phone = ?', [identifier]);
    } else {
      result = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [identifierLower]);
    }

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const storedHash = user.password_hash || '';

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, storedHash);
    } catch (_) {}

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        face_shape: user.face_shape || null,
        role: user.role || 'user',
        loyalty_points: user.loyalty_points || 0,
        referral_code: user.referral_code || null,
        avatar: user.avatar || null,
        createdAt: user.created_at || null
      }
    });

  } catch (err) {
    console.error('[Login Error]', err.message || err);
    return res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER STEP 1 — Initiate & Send OTP
// ══════════════════════════════════════════════════════════════════════════════
const registerInitiate = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    if (!password || String(password).trim() === '') {
      return res.status(400).json({ message: 'Password is required.' });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required.' });
    }

    // Auto-derive name if missing
    if (!name || String(name).trim() === '') {
      name = email ? email.split('@')[0] : `User${String(phone).slice(-4)}`;
    }

    const targetEmail = email ? String(email).toLowerCase().trim() : `phone_${String(phone).trim()}@specs.com`;
    const targetPhone = phone ? String(phone).trim() : null;

    // Check if already registered
    if (email) {
      const emailCheck = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [targetEmail]);
      if (emailCheck.rows && emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'This email is already registered. Please sign in.' });
      }
    }
    if (phone) {
      const phoneCheck = await db.query('SELECT id FROM users WHERE phone = ?', [targetPhone]);
      if (phoneCheck.rows && phoneCheck.rows.length > 0) {
        return res.status(400).json({ message: 'This phone number is already registered. Please sign in.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(String(password), salt);

    // Generate OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Ensure OTPs table exists
    try {
      await db.query(`CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT DEFAULT NULL,
        password_hash TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        verified INTEGER DEFAULT 0,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`);
    } catch (_) {}

    // Clean old OTPs for this email
    try {
      await db.query('DELETE FROM otps WHERE email = ?', [targetEmail]);
    } catch (_) {}

    // Save OTP record
    await db.query(
      'INSERT INTO otps (name, email, phone, password_hash, otp_code, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, targetEmail, targetPhone, passwordHash, otpCode, expiresAt]
    );

    // Try sending OTP email (non-blocking on failure)
    let sentViaEmail = false;
    if (email) {
      try {
        const { sendOtpEmail } = require('../utils/mailer');
        await sendOtpEmail({ to: targetEmail, otp: otpCode });
        sentViaEmail = true;
      } catch (mailErr) {
        console.warn('[OTP Email Failed]', mailErr.message);
      }
      console.log(`[OTP for ${targetEmail}]: ${otpCode}`);
    }

    return res.status(200).json({
      message: `Verification code: ${otpCode}. ${sentViaEmail ? 'Also sent to ' + targetEmail : 'Please enter this code below.'}`,
      email: email ? targetEmail : null,
      phone: targetPhone,
      sentViaEmail,
      otp: otpCode
    });

  } catch (err) {
    console.error('[RegisterInitiate Error]', err.message || err);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER STEP 2 — Verify OTP & Create User
// ══════════════════════════════════════════════════════════════════════════════
const registerVerify = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!otp || String(otp).trim() === '') {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    const targetEmail = email
      ? String(email).toLowerCase().trim()
      : `phone_${String(phone).trim()}@specs.com`;

    const otpRes = await db.query(
      'SELECT * FROM otps WHERE email = ? AND otp_code = ? AND verified = 0 ORDER BY created_at DESC LIMIT 1',
      [targetEmail, String(otp).trim()]
    );

    if (!otpRes.rows || otpRes.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or incorrect OTP code. Please try again.' });
    }

    const otpRecord = otpRes.rows[0];

    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
    }

    // Mark OTP verified
    await db.query('UPDATE otps SET verified = 1 WHERE id = ?', [otpRecord.id]);

    // Create user
    const referralCode = 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    await db.query(
      'INSERT INTO users (name, email, phone, password_hash, referral_code) VALUES (?, ?, ?, ?, ?)',
      [otpRecord.name, otpRecord.email, otpRecord.phone, otpRecord.password_hash, referralCode]
    );

    // Clean up OTPs
    try { await db.query('DELETE FROM otps WHERE email = ?', [otpRecord.email]); } catch (_) {}

    // Fetch new user
    const userRes = await db.query('SELECT * FROM users WHERE email = ?', [otpRecord.email]);
    const user = userRes.rows[0];
    const token = generateToken(user);

    // Auto-sync to CRM (non-blocking)
    try {
      const { upsertCrmLeadFromUser } = require('./crmController');
      upsertCrmLeadFromUser(user.id);
    } catch (_) {}

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        face_shape: user.face_shape || null,
        role: user.role || 'user',
        loyalty_points: user.loyalty_points || 0,
        referral_code: user.referral_code || null,
        createdAt: user.created_at || null
      }
    });

  } catch (err) {
    console.error('[RegisterVerify Error]', err.message || err);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// LEGACY REGISTER (single-step fallback)
// ══════════════════════════════════════════════════════════════════════════════
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const emailCheck = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (emailCheck.rows && emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(String(password), salt);
    const referralCode = 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    await db.query(
      'INSERT INTO users (name, email, password_hash, referral_code) VALUES (?, ?, ?, ?)',
      [String(name).trim(), cleanEmail, passwordHash, referralCode]
    );

    const newUserRes = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    const user = newUserRes.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        face_shape: user.face_shape || null,
        role: user.role || 'user',
        loyalty_points: user.loyalty_points || 0,
        referral_code: user.referral_code || null,
        createdAt: user.created_at || null
      }
    });

  } catch (err) {
    console.error('[Register Error]', err.message || err);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// GET PROFILE
// ══════════════════════════════════════════════════════════════════════════════
const getProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, phone, face_shape, role, loyalty_points, referral_code, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[GetProfile Error]', err.message || err);
    return res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE PROFILE
// ══════════════════════════════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
  try {
    const { name, phone, face_shape, password, avatar } = req.body;
    const userId = req.user.id;

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(String(name).trim()); }
    if (phone) { updates.push('phone = ?'); params.push(String(phone).trim()); }
    if (face_shape) { updates.push('face_shape = ?'); params.push(String(face_shape).toLowerCase().trim()); }
    if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
    if (password && String(password).trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(String(password), salt);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nothing to update.' });
    }

    params.push(userId);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    const updated = await db.query(
      'SELECT id, name, email, phone, face_shape, role, loyalty_points, referral_code, avatar, created_at FROM users WHERE id = ?',
      [userId]
    );
    return res.json(updated.rows[0]);

  } catch (err) {
    console.error('[UpdateProfile Error]', err.message || err);
    return res.status(500).json({ message: 'Server error updating profile.' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// SOCIAL LOGIN (Google / Facebook)
// ══════════════════════════════════════════════════════════════════════════════
const socialLogin = async (req, res) => {
  try {
    const { email, name, provider } = req.body;

    if (!email || !String(email).includes('@')) {
      return res.status(400).json({ message: 'Valid email is required for social login.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = name ? String(name).trim() : `${provider || 'Social'} User`;

    let userRes = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    if (!userRes.rows || userRes.rows.length === 0) {
      await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [cleanName, cleanEmail, `OAUTH_${(provider || 'SOCIAL').toUpperCase()}_NO_PASSWORD`]
      );
      userRes = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      try {
        const { sendWelcomeEmail } = require('../utils/mailer');
        sendWelcomeEmail({ to: cleanEmail, name: cleanName }).catch(() => {});
      } catch (_) {}
    }

    const user = userRes.rows[0];
    const token = generateToken(user);

    return res.json({
      message: `Signed in via ${provider || 'Social'}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role || 'user',
        loyalty_points: user.loyalty_points || 0,
        referral_code: user.referral_code || null,
        face_shape: user.face_shape || null,
        avatar: user.avatar || null,
        createdAt: user.created_at || null
      }
    });

  } catch (err) {
    console.error('[SocialLogin Error]', err.message || err);
    return res.status(500).json({ message: 'Social authentication failed. Please try again.' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════
module.exports = {
  login,
  register,
  registerInitiate,
  registerVerify,
  getProfile,
  updateProfile,
  socialLogin
};
