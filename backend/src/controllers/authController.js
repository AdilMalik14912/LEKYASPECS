const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, phone: user.phone || null, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register Step 1: Initiate & Send OTP
const registerInitiate = async (req, res) => {
  console.log('[Auth API] Initiate registration request received:', req.body);
  const { name, email, phone, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: 'Name and Password are required' });
  }
  if (!email && !phone) {
    return res.status(400).json({ message: 'Either Email or Phone is required' });
  }

  const targetEmail = email ? email.toLowerCase().trim() : `phone_${phone.trim()}@specs.com`;
  const targetPhone = phone ? phone.trim() : null;

  try {
    // Check if email already registered
    if (email) {
      const emailCheck = await db.query('SELECT id FROM users WHERE email = ?', [targetEmail]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    // Check if phone already registered
    if (phone) {
      const phoneCheck = await db.query('SELECT id FROM users WHERE phone = ?', [targetPhone]);
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins validity

    // Save to otps table
    await db.query(
      'INSERT INTO otps (name, email, phone, password_hash, otp_code, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, targetEmail, targetPhone, passwordHash, otpCode, expiresAt]
    );

    // Send OTP via email if email provided
    if (email) {
      try {
        const { sendOtpEmail } = require('../utils/mailer');
        await sendOtpEmail({ to: targetEmail, otp: otpCode });
      } catch (mailErr) {
        console.warn('SMTP OTP send failed, falling back to console:', mailErr.message);
      }
      console.log(`[OTP Sent to ${targetEmail}]: ${otpCode}`);
    } else {
      console.log(`[SMS OTP Sent to ${targetPhone}]: ${otpCode}`);
    }

    res.status(200).json({ 
      message: 'Verification OTP sent successfully.', 
      email: email ? targetEmail : null, 
      phone: targetPhone,
      otp: otpCode
    });
  } catch (err) {
    console.error('Register initiate error:', err);
    res.status(500).json({ message: 'Server error initiating registration' });
  }
};

// Register Step 2: Verify OTP & Insert User
const registerVerify = async (req, res) => {
  const { email, phone, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'Verification OTP code is required' });
  }

  const targetEmail = email ? email.toLowerCase().trim() : `phone_${phone.trim()}@specs.com`;

  try {
    // Fetch valid OTP from db
    const otpRes = await db.query(
      'SELECT * FROM otps WHERE email = ? AND otp_code = ? AND verified = 0 ORDER BY created_at DESC LIMIT 1',
      [targetEmail, otp.trim()]
    );

    if (otpRes.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or incorrect OTP code' });
    }

    const otpRecord = otpRes.rows[0];

    // Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({ message: 'OTP code has expired' });
    }

    // Mark as verified
    await db.query('UPDATE otps SET verified = 1 WHERE id = ?', [otpRecord.id]);

    // Create user record
    const referralCode = 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    await db.query(
      'INSERT INTO users (name, email, phone, password_hash, referral_code) VALUES (?, ?, ?, ?, ?)',
      [otpRecord.name, otpRecord.email, otpRecord.phone, otpRecord.password_hash, referralCode]
    );

    // Clean up OTPs for this email
    await db.query('DELETE FROM otps WHERE email = ?', [otpRecord.email]);

    // Fetch new user
    const userRes = await db.query(
      'SELECT id, name, email, phone, face_shape, role, loyalty_points, referral_code, created_at FROM users WHERE email = ?',
      [otpRecord.email]
    );
    const user = userRes.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        face_shape: user.face_shape,
        role: user.role || 'user',
        loyalty_points: user.loyalty_points || 0,
        referral_code: user.referral_code,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Verify registration error:', err);
    res.status(500).json({ message: 'Server error verifying registration' });
  }
};

// Legacy single-step registration for compatibility/fallback
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const emailCheck = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const referralCode = 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    await db.query(
      'INSERT INTO users (name, email, password_hash, referral_code) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase().trim(), passwordHash, referralCode]
    );

    const newUserRes = await db.query('SELECT id, name, email, phone, face_shape, role, loyalty_points, referral_code, created_at FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    const user = newUserRes.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        face_shape: user.face_shape,
        role: user.role || 'user',
        loyalty_points: user.loyalty_points || 0,
        referral_code: user.referral_code,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Legacy registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login User supporting Email or Phone
const login = async (req, res) => {
  const { email, password } = req.body; // email field holds identifier (email or phone)

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const identifier = email.trim();

  try {
    let result;
    const isPhone = /^[+\d\s()-]+$/.test(identifier) && identifier.length >= 7;
    
    if (isPhone) {
      result = await db.query('SELECT * FROM users WHERE phone = ?', [identifier]);
    } else {
      result = await db.query('SELECT * FROM users WHERE email = ?', [identifier.toLowerCase()]);
    }

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        face_shape: user.face_shape,
        role: user.role || 'user',
        loyalty_points: user.loyalty_points || 0,
        referral_code: user.referral_code,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, phone, face_shape, role, loyalty_points, referral_code, created_at FROM users WHERE id = ?', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update Face Shape or User Details
const updateProfile = async (req, res) => {
  const { name, phone, face_shape } = req.body;
  const userId = req.user.id;

  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }
  if (phone) {
    updates.push('phone = ?');
    params.push(phone.trim());
  }
  if (face_shape) {
    updates.push('face_shape = ?');
    params.push(face_shape.toLowerCase().trim());
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'Nothing to update' });
  }

  params.push(userId);

  try {
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    const updated = await db.query('SELECT id, name, email, phone, face_shape, role, loyalty_points, referral_code, created_at FROM users WHERE id = ?', [userId]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = {
  register,
  registerInitiate,
  registerVerify,
  login,
  getProfile,
  updateProfile
};
