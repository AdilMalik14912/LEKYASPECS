const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register User
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const userCheck = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email.toLowerCase().trim(), passwordHash]
    );

    // Fetch newly created user
    const newUserRes = await db.query('SELECT id, name, email, face_shape, role, created_at FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    const user = newUserRes.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        face_shape: user.face_shape,
        role: user.role || 'user',
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
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
        face_shape: user.face_shape,
        role: user.role || 'user',
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
    const result = await db.query('SELECT id, name, email, face_shape, created_at FROM users WHERE id = ?', [req.user.id]);
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
  const { name, face_shape } = req.body;
  const userId = req.user.id;

  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
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
    const updated = await db.query('SELECT id, name, email, face_shape, created_at FROM users WHERE id = ?', [userId]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
