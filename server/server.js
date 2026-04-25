/**
 * ===========================================
 * Local Market Online Store - Server Entry
 * ===========================================
 * Express server with MongoDB connection,
 * CORS support, and modular route mounting.
 * Serves the client directory as static files.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// ---------------------
// Middleware
// ---------------------
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /client
app.use(express.static(path.join(__dirname, '..', 'client')));

// ---------------------
// API Routes
// ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Local Market API is running', timestamp: new Date().toISOString() });
});

// ---------------------
// SPA Fallback: serve index.html for non-API routes
// ---------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// ---------------------
// Global Error Handler
// ---------------------
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 ============================================`);
      console.log(`   Local Market Store Server`);
      console.log(`   Running on: http://localhost:${PORT}`);
      console.log(`   API Base:   http://localhost:${PORT}/api`);
      console.log(`   Mode:       ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 ============================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
