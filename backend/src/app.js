const express = require('express');
const cors = require('cors');
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
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For development. Can be restricted in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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

// Initialize Database & Start Server
const startServer = async () => {
  try {
    await db.initDb();
    app.listen(PORT, () => {
      console.log(`[Specs Express API] Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup halted due to database error:', err.message);
    process.exit(1);
  }
};

startServer();
