// Lekya Specs Backend API — Parcel Uncle Live Integration Release 1.0.2
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
const stylistController = require('./controllers/stylistController');
const sellerController = require('./controllers/sellerController');
const deliveryController = require('./controllers/deliveryController');
const chatController = require('./controllers/chatController');
const crmController = require('./controllers/crmController');
const hoStaffController = require('./controllers/hoStaffController');
const shippingController = require('./controllers/shippingController');
const returnController = require('./controllers/returnController');
const whatsappWebhookController = require('./controllers/whatsappWebhookController');


// Middlewares
const { authenticateToken, isAdmin, isSeller, isDelivery, isHoStaff } = require('./middleware/auth');
const { 
  strictLimiter, 
  generalLimiter, 
  userAgentShield, 
  validateHoneypot, 
  validateCaptcha 
} = require('./middleware/security');

// Captcha Utility
const { getCaptchaPayload } = require('./utils/captcha');

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

// Enable CORS — allow all Vercel preview deployments + localhost
app.use(cors({
  origin: (origin, callback) => {
    // Allow any request (no origin = same-origin, or allow all)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors()); // Handle preflight requests

// Enterprise Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// 0. WhatsApp Business API Webhook — MUST be before rate limiters
//    GET: Meta webhook verification challenge
//    POST: Incoming messages & auto-reply engine
app.get('/api/webhooks/whatsapp', whatsappWebhookController.verifyWebhook);
app.post('/api/webhooks/whatsapp', whatsappWebhookController.handleIncomingMessage);

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Captcha Endpoint
app.get('/api/auth/captcha', (req, res) => {
  res.json(getCaptchaPayload());
});

// 2. Authentication API
app.post('/api/auth/register', authController.register);
app.post('/api/auth/register/initiate', authController.registerInitiate);
app.post('/api/auth/register/verify', authController.registerVerify);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', authenticateToken, authController.getProfile);
app.put('/api/auth/profile', authenticateToken, authController.updateProfile);

app.post('/api/auth/social-login', authController.socialLogin);

// 2b. Google OAuth
app.get('/api/auth/google', async (req, res, next) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const fUrl = getFrontendUrl(req);

  if (!googleClientId || !googleClientSecret || googleClientId === 'dummy_client_id_to_prevent_passport_crash') {
    // Redirect to frontend Google Account Selection Modal so user can choose/enter their actual Google credentials
    return res.redirect(`${fUrl}/account?open_social_modal=google`);
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
    res.redirect(`${fUrl}/oauth-success?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${encodeURIComponent(user.role || 'user')}&provider=Google`);
  })(req, res, next);
});


// 2c. Facebook OAuth
app.get('/api/auth/facebook', async (req, res) => {
  const fbClientId = process.env.FACEBOOK_CLIENT_ID;
  const fbClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const fUrl = getFrontendUrl(req);

  if (!fbClientId || !fbClientSecret) {
    // Redirect to frontend Facebook Account Selection Modal so user can choose/enter their actual Facebook credentials
    return res.redirect(`${fUrl}/account?open_social_modal=facebook`);
  } else {
    // Redirect to real Facebook OAuth if credentials exist
    res.redirect(`https://www.facebook.com/v12.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${encodeURIComponent(fUrl + '/api/auth/facebook/callback')}&scope=email`);
  }
});

app.get('/api/auth/facebook/callback', async (req, res) => {
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
app.post('/api/orders/webhook', orderController.handleRazorpayWebhook);
app.get('/api/orders/history', authenticateToken, orderController.getOrders);
app.get('/api/orders/track/:trackingId', orderController.trackOrderByTrackingId);

// 5. Reviews API
app.post('/api/orders/review', authenticateToken, orderController.addReview);

// 6. Contact Us (Public)
app.post('/api/contact', strictLimiter, validateHoneypot, validateCaptcha, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Name, email, subject and message are required' });
  }
  try {
    await db.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, subject, message]
    );
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
app.put('/api/admin/customers/:id/credentials', authenticateToken, isAdmin, adminController.updateCustomerCredentials);
app.put('/api/admin/users/:id/password',        authenticateToken, isAdmin, adminController.updateUserPassword);
app.post('/api/admin/products', authenticateToken, isAdmin, adminController.addProduct);
app.put('/api/admin/products/:id', authenticateToken, isAdmin, adminController.updateProduct);
app.delete('/api/admin/products/:id', authenticateToken, isAdmin, adminController.deleteProduct);
app.put('/api/admin/settings', authenticateToken, isAdmin, adminController.updateSettings);
app.post('/api/admin/create-admin', authenticateToken, isAdmin, adminController.createAdminUser);
app.get('/api/admin/admins', authenticateToken, isAdmin, adminController.getAdminList);
app.post('/api/admin/demote-admin', authenticateToken, isAdmin, adminController.demoteAdminUser);
app.get('/api/admin/otps', authenticateToken, isAdmin, adminController.getRecentOtps);

// Coupons / Promos
app.post('/api/admin/coupons', authenticateToken, isAdmin, adminController.createCoupon);
app.get('/api/admin/coupons', authenticateToken, isAdmin, adminController.getCoupons);
app.put('/api/admin/coupons/:id', authenticateToken, isAdmin, adminController.toggleCouponStatus);
app.delete('/api/admin/coupons/:id', authenticateToken, isAdmin, adminController.deleteCoupon);

// Email Broadcast
app.post('/api/admin/broadcast', authenticateToken, isAdmin, adminController.broadcastEmail);

// CSV Data Export
app.get('/api/admin/export/orders', authenticateToken, isAdmin, adminController.exportOrdersCSV);
app.get('/api/admin/export/customers', authenticateToken, isAdmin, adminController.exportCustomersCSV);

// Admin Activity Log
app.get('/api/admin/logs', authenticateToken, isAdmin, adminController.getActivityLogs);

// Real-time Coupon validation
app.post('/api/coupons/validate', authenticateToken, orderController.validateCouponCode);

// Return & Exchange Customer Self-Service Endpoints
app.post('/api/returns/request', authenticateToken, returnController.createReturn);
app.get('/api/returns/my-returns', authenticateToken, returnController.getUserReturns);
app.get('/api/admin/returns', authenticateToken, isAdmin, returnController.getAllReturns);
app.put('/api/admin/returns/:returnId', authenticateToken, isAdmin, returnController.updateReturnStatus);


// Database Health & Performance Monitor
app.get('/api/admin/db/health', authenticateToken, isAdmin, adminController.getDatabaseHealth);
app.post('/api/admin/db/optimize', authenticateToken, isAdmin, adminController.optimizeDatabase);

// Helpdesk Reply Hub
app.get('/api/admin/helpdesk', authenticateToken, isAdmin, adminController.getContactMessages);
app.post('/api/admin/helpdesk/:id/reply', authenticateToken, isAdmin, adminController.replyContactMessage);

// Customer Deep Inspect Profile details
app.get('/api/admin/customers/:id', authenticateToken, isAdmin, adminController.getCustomerDetail);
app.put('/api/admin/customers/:id/credentials', authenticateToken, isAdmin, adminController.updateCustomerCredentials);

// Order tracking Visual updates
app.put('/api/admin/orders/:id/tracking', authenticateToken, isAdmin, adminController.updateOrderTracking);

// Real-time Active Sessions list & Live Signup OTP Feed
app.get('/api/admin/active-sessions', authenticateToken, isAdmin, adminController.getActiveSessions);

// ── Parcel Uncle Official Merchant Carrier Integration API (v1) ─────────────
app.post('/api/shipping/parcel-uncle/dispatch', authenticateToken, shippingController.dispatchParcelUncle);
app.get('/api/shipping/parcel-uncle/track/:waybill', shippingController.trackParcelUncle);
app.get('/api/shipping/parcel-uncle/label/:waybillOrOrderId', shippingController.downloadLabel);
app.get('/api/admin/orders/:waybillOrOrderId/label', shippingController.downloadLabel);
app.post('/api/shipping/parcel-uncle/cancel/:waybill', authenticateToken, shippingController.cancelParcelUncle);
app.get('/api/shipping/parcel-uncle/serviceability/:pincode', shippingController.checkServiceabilityHandler);
app.post('/api/shipping/parcel-uncle/rate-quote', shippingController.getRateQuoteHandler);
app.post('/api/shipping/parcel-uncle/webhook', shippingController.handleWebhook);
app.get('/api/shipping/parcel-uncle/ndr', authenticateToken, shippingController.getNdrListHandler);
// ── Courier Uncle Pan-India Aggregator API & Smart Auto-Router ──────────────
app.post('/api/shipping/courier-uncle/dispatch', authenticateToken, shippingController.dispatchCourierUncle);
app.post('/api/shipping/smart-dispatch', authenticateToken, shippingController.dispatchSmartShipment);


// 8. Seller Panel API (seller + admin access)
app.get('/api/seller/stats', authenticateToken, isSeller, sellerController.getSellerStats);
app.get('/api/seller/products', authenticateToken, isSeller, sellerController.getSellerProducts);
app.get('/api/seller/orders', authenticateToken, isSeller, sellerController.getSellerOrders);
app.put('/api/seller/orders/:id/status', authenticateToken, isSeller, sellerController.updateSellerOrderStatus);
app.put('/api/seller/orders/:id/assign', authenticateToken, isSeller, sellerController.assignDeliveryAgent);
app.get('/api/seller/delivery-agents', authenticateToken, isSeller, sellerController.getDeliveryAgents);

// Smart Rider Features
app.post('/api/seller/orders/:id/auto-assign', authenticateToken, isSeller, sellerController.autoAssignDeliveryAgent);
app.put('/api/seller/orders/:id/urgent', authenticateToken, isSeller, sellerController.toggleOrderUrgent);
app.get('/api/seller/agent-workloads', authenticateToken, isSeller, sellerController.getAgentWorkloads);
app.get('/api/seller/stale-orders', authenticateToken, isSeller, sellerController.getStaleOrders);

// 9. Delivery Agent Panel API (delivery + admin access)
app.get('/api/delivery/stats', authenticateToken, isDelivery, deliveryController.getMyStats);
app.get('/api/delivery/my-orders', authenticateToken, isDelivery, deliveryController.getMyDeliveries);
app.get('/api/delivery/available', authenticateToken, isDelivery, deliveryController.getAvailableOrders);
app.post('/api/delivery/claim/:id', authenticateToken, isDelivery, deliveryController.claimOrder);
app.put('/api/delivery/orders/:id/status', authenticateToken, isDelivery, deliveryController.updateDeliveryStatus);
app.post('/api/delivery/orders/:id/resend-otp', authenticateToken, isDelivery, deliveryController.resendDeliveryOtp);

// Map & Location Tracking
app.put('/api/delivery/location', authenticateToken, isDelivery, deliveryController.updateRiderLocation);
app.get('/api/delivery/map-orders', authenticateToken, isDelivery, deliveryController.getMyMapOrders);
app.get('/api/admin/riders/live-map', authenticateToken, isAdmin, adminController.getRidersLiveMap);

// Admin: View all OTPs for active Out for Delivery orders
app.get('/api/admin/delivery-otps', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.delivery_otp, o.status, o.created_at,
              u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
              a.name as agent_name, a.email as agent_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN users a ON o.assigned_delivery_agent_id = a.id
       WHERE o.delivery_otp IS NOT NULL AND o.status = 'Out for Delivery'
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get delivery OTPs error:', err);
    res.status(500).json({ message: 'Server error fetching OTPs' });
  }
});

// 10. Admin: Change user role
app.put('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const allowedRoles = ['user', 'seller', 'delivery', 'admin', 'stylist', 'ho_staff'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    const userRes = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    res.json({ message: `User role updated to ${role}`, user: userRes.rows[0] });
  } catch (err) {
    console.error('Role update error:', err);
    res.status(500).json({ message: 'Server error updating role' });
  }
});

// 11. Admin: Get all users with roles (for team management)
app.get('/api/admin/team', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, phone, role, loyalty_points, created_at
       FROM users ORDER BY role ASC, created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get team error:', err);
    res.status(500).json({ message: 'Server error fetching team' });
  }
});

// --- Brand Stylist Hub APIs ---
app.get('/api/stylist/products', authenticateToken, stylistController.getProducts);
app.put('/api/stylist/products/:id/tags', authenticateToken, stylistController.updateProductTags);
app.get('/api/stylist/lookbook', stylistController.getLookbook);
app.post('/api/stylist/lookbook', authenticateToken, stylistController.updateLookbook);
app.get('/api/stylist/calendar', stylistController.getCalendar);
app.post('/api/stylist/calendar', authenticateToken, stylistController.updateCalendar);
app.get('/api/stylist/spotlight', stylistController.getSpotlight);
app.post('/api/stylist/spotlight', authenticateToken, stylistController.updateSpotlight);
app.get('/api/stylist/color-stories', stylistController.getColorStories);
app.post('/api/stylist/color-stories', authenticateToken, stylistController.updateColorStories);
app.get('/api/stylist/advisor', stylistController.getAdvisor);
app.post('/api/stylist/advisor', authenticateToken, stylistController.updateAdvisor);
app.get('/api/stylist/reviews', authenticateToken, stylistController.getReviews);
app.put('/api/stylist/reviews/:id/spotlight', authenticateToken, stylistController.toggleReviewSpotlight);
app.get('/api/stylist/tone-profile', stylistController.getToneProfile);
app.post('/api/stylist/tone-profile', authenticateToken, stylistController.updateToneProfile);

// ─── 12. Team Chat API ─────────────────────────────────────────────────────────
// Middleware: only allow admin, seller, delivery, or stylist roles
const isTeamMember = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const allowedRoles = ['admin', 'seller', 'delivery', 'stylist', 'ho_staff'];
  const adminEmails  = ['dev.parceluncle@gmail.com', 'admin@specs.com'];
  if (allowedRoles.includes(req.user.role) || adminEmails.includes(req.user.email)) {
    return next();
  }
  res.status(403).json({ message: 'Chat is only available to team members' });
};

// Team members list + online presence
app.get('/api/chat/team',                                 authenticateToken, isTeamMember, chatController.getTeamMembers);

// Conversations
app.get('/api/chat/conversations',                        authenticateToken, isTeamMember, chatController.getConversations);
app.post('/api/chat/conversations/dm',                    authenticateToken, isTeamMember, chatController.getDmConversation);
app.post('/api/chat/conversations/group',                 authenticateToken, isTeamMember, chatController.createGroup);
app.delete('/api/chat/conversations/:id',                 authenticateToken, isTeamMember, chatController.leaveConversation);

// Messages
app.get('/api/chat/conversations/:id/messages',           authenticateToken, isTeamMember, chatController.getMessages);
app.post('/api/chat/conversations/:id/messages',          authenticateToken, isTeamMember, chatController.sendMessage);
app.post('/api/chat/conversations/:id/read',              authenticateToken, isTeamMember, chatController.markRead);

// Pinned messages & shared files
app.get('/api/chat/conversations/:id/pinned',             authenticateToken, isTeamMember, chatController.getPinnedMessages);
app.get('/api/chat/conversations/:id/files',              authenticateToken, isTeamMember, chatController.getSharedFiles);

// Group members
app.get('/api/chat/conversations/:id/members',            authenticateToken, isTeamMember, chatController.getMembers);
app.post('/api/chat/conversations/:id/members',           authenticateToken, isTeamMember, chatController.addMember);
app.delete('/api/chat/conversations/:id/members/:uid',    authenticateToken, isTeamMember, chatController.removeMember);

// Per-message actions
app.put('/api/chat/messages/:id/pin',                     authenticateToken, isTeamMember, chatController.togglePin);
app.put('/api/chat/messages/:id/edit',                    authenticateToken, isTeamMember, chatController.editMessage);
app.put('/api/chat/messages/:id',                         authenticateToken, isTeamMember, chatController.updateMessage);
app.delete('/api/chat/messages/:id',                      authenticateToken, isTeamMember, chatController.deleteMessage);
app.post('/api/chat/messages/:id/react',                  authenticateToken, isTeamMember, chatController.toggleReaction);

// Typing indicators
app.post('/api/chat/typing',                              authenticateToken, isTeamMember, chatController.setTyping);
app.get('/api/chat/typing/:id',                           authenticateToken, isTeamMember, chatController.getTyping);

// ── CRM System Routes ────────────────────────────────────────────────────────
app.get('/api/crm/stats',                  authenticateToken, isTeamMember, crmController.getDashboardStats);
app.get('/api/crm/leads',                  authenticateToken, isTeamMember, crmController.getLeads);
app.get('/api/crm/leads/:id',              authenticateToken, isTeamMember, crmController.getLeadById);
app.post('/api/crm/leads',                 authenticateToken, isTeamMember, crmController.createLead);
app.put('/api/crm/leads/:id',              authenticateToken, isTeamMember, crmController.updateLead);
app.post('/api/crm/leads/:id/interactions',authenticateToken, isTeamMember, crmController.logInteraction);
app.get('/api/crm/tasks',                  authenticateToken, isTeamMember, crmController.getTasks);
app.post('/api/crm/tasks',                 authenticateToken, isTeamMember, crmController.createTask);
app.put('/api/crm/tasks/:id',              authenticateToken, isTeamMember, crmController.updateTask);
app.post('/api/crm/auto-sync',             authenticateToken, isTeamMember, crmController.autoSyncLeads);
app.post('/api/crm/ai-automate',             authenticateToken, isTeamMember, crmController.autoRunAiEngine);
app.post('/api/crm/ai-generate-email',        authenticateToken, isTeamMember, crmController.generateAiOfferTemplate);

// 13. HO Staff API
app.post('/api/ho-staff/reports', authenticateToken, isHoStaff, hoStaffController.submitReport);
app.get('/api/ho-staff/reports', authenticateToken, isHoStaff, hoStaffController.getMyReports);
app.get('/api/ho-staff/all-reports', authenticateToken, isAdmin, hoStaffController.getAllReports);

// 14. Parcel Uncle Logistics & Shipping Integration API (100% Complete Suite)
app.post('/api/shipping/parcel-uncle/dispatch/:orderId', authenticateToken, isTeamMember, shippingController.dispatchParcelUncle);
app.post('/api/shipping/parcel-uncle/sync/:orderId', authenticateToken, isTeamMember, shippingController.syncParcelUncleHandler);
app.post('/api/shipping/parcel-uncle/webhook', shippingController.handleWebhook);
app.put('/api/shipping/parcel-uncle/register-webhook', authenticateToken, isTeamMember, shippingController.registerWebhookHandler);
app.get('/api/shipping/parcel-uncle/track/:waybillOrOrderId', shippingController.trackParcelUncle);
app.get('/api/shipping/parcel-uncle/label/:waybillOrOrderId', shippingController.downloadLabel);
app.get('/api/shipping/parcel-uncle/ndr', authenticateToken, isTeamMember, shippingController.getNdrListHandler);
app.post('/api/shipping/parcel-uncle/ndr/:trackingNumber/action', authenticateToken, isTeamMember, shippingController.takeNdrActionHandler);
app.get('/api/shipping/parcel-uncle/serviceability', shippingController.checkServiceabilityHandler);
app.post('/api/shipping/parcel-uncle/rates', shippingController.getRateQuoteHandler);
app.post('/api/shipping/parcel-uncle/cancel/:orderId', authenticateToken, isTeamMember, shippingController.cancelParcelUncle);
app.get('/api/shipping/parcel-uncle/config', authenticateToken, isTeamMember, shippingController.getConfig);

// 15. Customer Returns & Exchanges API
app.post('/api/returns', authenticateToken, returnController.createReturn);
app.get('/api/returns/my', authenticateToken, returnController.getUserReturns);
app.get('/api/returns/all', authenticateToken, isAdmin, returnController.getAllReturns);
app.put('/api/returns/:returnId/status', authenticateToken, isAdmin, returnController.updateReturnStatus);

// Global Error Handler

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error occurred' });
});

// Database maintenance: Garbage collection of expired sessions & stale OTPs
const cleanExpiredDatabaseRecords = async () => {
  try {
    await db.query("DELETE FROM otps WHERE expires_at < datetime('now') OR verified = 1");
    await db.query("DELETE FROM active_sessions WHERE last_active_at < datetime('now', '-7 days')");
    console.log('[DB Maintenance] Expired OTPs and inactive sessions cleaned up successfully.');
  } catch (err) {
    console.warn('[DB Maintenance Warning]:', err.message);
  }
};

// Initialize Database — non-fatal in serverless
const initDb = async () => {
  try {
    await db.initDb();
    console.log('[Specs Express API] Database initialized.');
    cleanExpiredDatabaseRecords();
  } catch (err) {
    // DO NOT call process.exit(1) in serverless — it kills all future requests
    console.error('[DB Init Warning] Non-fatal — server will still handle requests:', err.message);
  }
};

// Local dev: start HTTP server directly
// Vercel serverless: export the app after DB init
if (require.main === module) {
  // Running locally with `node src/app.js`
  (async () => {
    await initDb();
    setInterval(cleanExpiredDatabaseRecords, 60 * 60 * 1000);
    app.listen(PORT, () => {
      console.log(`[Specs Express API] Server is running on port ${PORT}`);
    });
  })();
} else {
  // Vercel: initialize DB then export handler
  initDb();
  module.exports = app;
}
