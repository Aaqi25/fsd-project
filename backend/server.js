const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const { sanitizeMongoUri, sanitizeError } = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const deviceRoutes = require('./src/routes/deviceRoutes');

// Global error traps for unhandled events
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', sanitizeError(err));
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', sanitizeError(reason));
});

// Environment variable normalization (trim quotes/spaces)
const rawJwtSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim().replace(/^["']|["']$/g, '') : '';
const rawMongoUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim().replace(/^["']|["']$/g, '') : '';

// Assign back normalized variables
if (rawJwtSecret) process.env.JWT_SECRET = rawJwtSecret;
if (rawMongoUri) process.env.MONGODB_URI = rawMongoUri;

const isProduction = process.env.NODE_ENV === 'production';

// Critical secret validation
if (isProduction && !rawJwtSecret) {
  console.error('❌ FATAL: JWT_SECRET environment variable is missing.');
  console.error('   Please add JWT_SECRET in your Render dashboard environment variables.');
  process.exit(1);
}

if (isProduction && !rawMongoUri) {
  console.warn('⚠️ WARNING: MONGODB_URI is not set in production. Database operations will return 503.');
}

const app = express();

// Middleware: Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: CORS Configuration
const allowedOrigins = [
  'https://fsd-project-bice.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Database Availability Guard Middleware
const dbCheckMiddleware = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    const stateMap = { 0: 'disconnected', 2: 'connecting', 3: 'disconnecting' };
    const currentStatus = stateMap[mongoose.connection.readyState] || 'unknown';
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please verify MONGODB_URI and MongoDB Atlas network access.',
      databaseStatus: currentStatus,
    });
  }
  next();
};

// Health Check Endpoint (Both /api/health and /health)
const healthHandler = (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbStatus = stateMap[mongoose.connection.readyState] || 'unknown';

  return res.status(200).json({
    status: 'ok',
    service: 'SmartHome API',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount API Routes (with db availability check)
app.use('/api/auth', dbCheckMiddleware, authRoutes);
app.use('/auth', dbCheckMiddleware, authRoutes);

app.use('/api/devices', dbCheckMiddleware, deviceRoutes);
app.use('/devices', dbCheckMiddleware, deviceRoutes);

// Root informational route
app.get('/', (req, res) => {
  res.json({
    message: 'SmartHome Express.js API is running.',
    health: '/api/health',
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
  console.error('Unhandled Application Error:', sanitizeError(err));
  res.status(err.status || 500).json({
    success: false,
    message: sanitizeError(err) || 'Internal server error.',
  });
});

// Port and Host Configuration (Render binds to process.env.PORT on 0.0.0.0)
const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

// Diagnostic Banner
console.log('===============================================');
console.log(`Node.js Version: ${process.version}`);
console.log(`Environment:     ${process.env.NODE_ENV || 'development'}`);
console.log(`Bound Port:      ${PORT}`);
console.log(`Bound Host:      ${HOST}`);
console.log(`JWT_SECRET:      ${rawJwtSecret ? 'Configured (length: ' + rawJwtSecret.length + ')' : 'MISSING'}`);
console.log(`MONGODB_URI:     ${sanitizeMongoUri(rawMongoUri)}`);
console.log('===============================================');

// START LISTENING IMMEDIATELY: Ensures Render port detection succeeds within seconds
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 SmartHome Backend HTTP server active on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check available at http://${HOST}:${PORT}/api/health`);
});

// Initiate MongoDB connection asynchronously
connectDB().catch((err) => {
  console.error('❌ Unexpected error during MongoDB initialization:', sanitizeError(err));
});

module.exports = app;
module.exports.server = server;
