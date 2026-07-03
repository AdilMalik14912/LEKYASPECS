const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const db = require('./config/db');
require('dotenv').config();

// Controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const adminController = require('./controllers/adminController');

// Middlewares
const { authenticateToken, isAdmin } = require('./middleware/auth');

// Email Service
const { sendContactEmail } = require('./utils/mailer');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Helper to dynamically resolve the frontend URL (to prevent issues on dynamic Vercel deployments)
const getFrontendUrl = (req) => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    return `${protocol}://${req.get('host')}`;
  }
  return 'http://localhost:3000';
};

// Enable CORS
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Session (required for Passport OAuth)
app.use(session({
  secret: process.env.JWT_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 10 * 60 * 1000 } // 10 min — just for OAuth handshake
}));
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 2. Authentication API
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', authenticateToken, authController.getProfile);
app.put('/api/auth/profile', authenticateToken, authController.updateProfile);

// 2b. Google OAuth
app.get('/api/auth/google', async (req, res, next) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const fUrl = getFrontendUrl(req);

  if (!googleClientId || !googleClientSecret || googleClientId === 'dummy_client_id_to_prevent_passport_crash') {
    // If no credentials, simulate Google OAuth instantly
    const mockEmail = 'google_adil.specs@gmail.com';
    const mockName = 'Adil Malik (via Google)';

    try {
      let userRes = await db.query('SELECT * FROM users WHERE email = ?', [mockEmail]);
      if (userRes.rows.length === 0) {
        await db.query(
          `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
          [mockName, mockEmail, 'OAUTH_GOOGLE_MOCK_PASSWORD']
        );
        userRes = await db.query('SELECT * FROM users WHERE email = ?', [mockEmail]);
        // Send welcome email (non-blocking)
        const { sendWelcomeEmail } = require('./utils/mailer');
        sendWelcomeEmail({ to: mockEmail, name: mockName }).catch(console.warn);
      }
      const user = userRes.rows[0];
      const { signToken } = require('./utils/jwt');
      const token = signToken({ id: user.id, name: user.name, email: user.email });

      return res.redirect(`${fUrl}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
    } catch (err) {
      console.error('Mock Google OAuth error:', err);
      return res.redirect(`${fUrl}/account?error=google_failed`);
    }
  } else {
    // Redirect to real Google OAuth
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }
});

app.get('/api/auth/google/callback', (req, res, next) => {
  const fUrl = getFrontendUrl(req);
  passport.authenticate('google', { session: false }, (err, userAndToken) => {
    if (err || !userAndToken) {
      console.error('Google OAuth callback error:', err);
      return res.redirect(`${fUrl}/account?error=google_failed`);
    }
    const { token, user } = userAndToken;
    res.redirect(`${fUrl}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
  })(req, res, next);
});


// 2c. Facebook OAuth (Mockable / Real)
// Since Facebook OAuth requires custom developers portal config, we provide an automatic interactive simulation if keys are empty.
app.get('/api/auth/facebook', async (req, res) => {
  const fbClientId = process.env.FACEBOOK_CLIENT_ID;
  const fbClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const fUrl = getFrontendUrl(req);

  if (!fbClientId || !fbClientSecret) {
    // If credentials are empty, simulate Facebook OAuth instantly
    // We register/login a mock Facebook User
    const mockEmail = 'fb_adil.specs@gmail.com';
    const mockName = 'Adil Malik (via Facebook)';

    try {
      let userRes = await db.query('SELECT * FROM users WHERE email = ?', [mockEmail]);
      if (userRes.rows.length === 0) {
        await db.query(
          `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
          [mockName, mockEmail, 'OAUTH_FACEBOOK_MOCK_PASSWORD']
        );
        userRes = await db.query('SELECT * FROM users WHERE email = ?', [mockEmail]);
        // Send welcome email (non-blocking)
        const { sendWelcomeEmail } = require('./utils/mailer');
        sendWelcomeEmail({ to: mockEmail, name: mockName }).catch(console.warn);
      }
      const user = userRes.rows[0];
      const { signToken } = require('./utils/jwt');
      const token = signToken({ id: user.id, name: user.name, email: user.email });

      return res.redirect(`${fUrl}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
    } catch (err) {
      console.error('Mock Facebook OAuth error:', err);
      return res.redirect(`${fUrl}/account?error=facebook_failed`);
    }
  } else {
    // Redirect to real Facebook OAuth if credentials exist
    res.redirect(`https://www.facebook.com/v12.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${encodeURIComponent(fUrl + '/api/auth/facebook/callback')}&scope=email`);
  }
});

app.get('/api/auth/facebook/callback', async (req, res) => {
  // If real Facebook OAuth was used
  const fUrl = getFrontendUrl(req);
  res.redirect(`${fUrl}/oauth-success?error=not_fully_configured`);
});


// 3. Products API
app.get('/api/products', productController.getProducts);
app.get('/api/products/filters', productController.getFilterOptions);
app.get('/api/products/recommendations/:face_shape', productController.getRecommendations);
app.get('/api/products/:id', productController.getProductById);
app.get('/api/settings', adminController.getSettings);

// 4. Orders & Checkout API
app.post('/api/orders/create', authenticateToken, orderController.createOrder);
app.post('/api/orders/verify', authenticateToken, orderController.verifyPayment);
app.get('/api/orders/history', authenticateToken, orderController.getOrders);

// 5. Reviews API
app.post('/api/orders/review', authenticateToken, orderController.addReview);

// 6. Contact Us (Public)
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Name, email, subject and message are required' });
  }
  try {
    await sendContactEmail({ name, email, phone, subject, message });
    res.json({ message: 'Message sent successfully! We will get back to you within 24 hours.' });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

// 7. Admin Panel API (Protected)
app.get('/api/admin/stats', authenticateToken, isAdmin, adminController.getDashboardStats);
app.get('/api/admin/orders', authenticateToken, isAdmin, adminController.getAdminOrders);
app.put('/api/admin/orders/:id', authenticateToken, isAdmin, adminController.updateOrderStatus);
app.get('/api/admin/customers', authenticateToken, isAdmin, adminController.getAdminCustomers);
app.post('/api/admin/products', authenticateToken, isAdmin, adminController.addProduct);
app.put('/api/admin/products/:id', authenticateToken, isAdmin, adminController.updateProduct);
app.delete('/api/admin/products/:id', authenticateToken, isAdmin, adminController.deleteProduct);
app.put('/api/admin/settings', authenticateToken, isAdmin, adminController.updateSettings);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error occurred' });
});

// Initialize Database
const initDb = async () => {
  try {
    await db.initDb();
    console.log('[Specs Express API] Database initialized.');
  } catch (err) {
    console.error('DB init error:', err.message);
    process.exit(1);
  }
};

// Local dev: start HTTP server directly
// Vercel serverless: export the app after DB init
if (require.main === module) {
  // Running locally with `node src/app.js`
  (async () => {
    await initDb();
    app.listen(PORT, () => {
      console.log(`[Specs Express API] Server is running on port ${PORT}`);
    });
  })();
} else {
  // Vercel: initialize DB then export handler
  initDb();
  module.exports = app;
}
