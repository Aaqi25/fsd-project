const dotenv = require('dotenv');
// Load environment variables from .env file if available
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const deviceRoutes = require('./src/routes/deviceRoutes');

// Validate critical secrets in production before startup
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not defined.');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }
}

const app = express();

// Middleware: Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: CORS Configuration
const allowedOrigins = [
  'https://fsd-project-bice.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint (both /api/health and /health)
const healthHandler = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return res.status(200).json({
    status: 'ok',
    service: 'SmartHome API',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount API routes: Support both with and without '/api' prefix for flexible VITE_API_URL
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/devices', deviceRoutes);
app.use('/devices', deviceRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SmartHome Express.js API is running.',
    documentation: '/api/health',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`===============================================`);
    console.log(`🚀 SmartHome Backend running on http://${HOST}:${PORT}`);
    console.log(`📡 Health Check: http://${HOST}:${PORT}/api/health`);
    console.log(`🔒 Authentication: JWT (Secret configured)`);
    console.log(`===============================================`);
  });
});

module.exports = app;
