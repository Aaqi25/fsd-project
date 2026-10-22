const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Device = require('../models/Device');
const seedDevices = require('../data/seedDevices');

/**
 * Safely sanitize MongoDB URI for logging (masks password).
 * E.g., mongodb+srv://user:secret@cluster0.abc.mongodb.net/db -> mongodb+srv://user:*****@cluster0.abc.mongodb.net/db
 */
function sanitizeMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return '(not configured)';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)@/i, '$1*****@');
}

/**
 * Safely sanitize error messages removing any raw URI credentials.
 */
function sanitizeError(err) {
  if (!err) return 'Unknown error';
  const msg = typeof err === 'string' ? err : err.message || String(err);
  return msg.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)@/gi, '$1*****@');
}

// Track seeding state to prevent race conditions
let isSeeded = false;

async function seedInitialData() {
  if (isSeeded) return;

  try {
    // 1. Seed Demo Users if collection is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultPassword = 'password123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      await User.insertMany([
        {
          name: 'Alex',
          username: 'alex_owner',
          email: 'alex@smarthome.io',
          password: hashedPassword,
          role: 'owner',
        },
        {
          name: 'Sarah',
          username: 'sarah_resident',
          email: 'sarah.j@smarthome.io',
          password: hashedPassword,
          role: 'resident',
        },
        {
          name: 'Guest',
          username: 'guest_user',
          email: 'guest@smarthome.io',
          password: hashedPassword,
          role: 'guest',
        },
      ]);
      console.log('✓ Seeded default demo profiles (alex@smarthome.io, sarah.j@smarthome.io, guest@smarthome.io)');
    }

    // 2. Seed Initial Devices if collection is empty
    const deviceCount = await Device.countDocuments();
    if (deviceCount === 0) {
      await Device.insertMany(seedDevices);
      console.log(`✓ Seeded ${seedDevices.length} initial home appliances into MongoDB`);
    }

    isSeeded = true;
  } catch (err) {
    console.warn('⚠️ Auto-seeding skipped or encountered error:', sanitizeError(err));
  }
}

// Register Mongoose connection state event listeners once
mongoose.connection.on('connected', () => {
  console.log('✓ MongoDB connection established successfully.');
  seedInitialData();
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', sanitizeError(err));
});

async function connectDB() {
  const rawUri = process.env.MONGODB_URI;
  const uri = rawUri ? rawUri.trim().replace(/^["']|["']$/g, '') : '';

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not defined. The server will run in offline mode without database persistence.');
    return null;
  }

  const sanitized = sanitizeMongoUri(uri);
  console.log(`📡 Connecting to MongoDB: ${sanitized}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of hanging 30s
      connectTimeoutMS: 10000,
    });
    return conn;
  } catch (error) {
    const errorMsg = sanitizeError(error);
    console.error(`❌ MongoDB Initial Connection Failed: ${errorMsg}`);
    console.error(`   Target URI: ${sanitized}`);

    // Contextual diagnostics to guide immediate resolution
    if (error.name === 'MongooseServerSelectionError' || errorMsg.includes('Server selection timed out')) {
      console.error('   [DIAGNOSTIC] Connection timed out selecting server.');
      console.error('   → MongoDB Atlas Network Access: Ensure IP "0.0.0.0/0" (Allow Access from Anywhere) is added.');
      console.error('   → Cluster Status: Verify the MongoDB Atlas cluster is active and not paused.');
    } else if (errorMsg.includes('bad auth') || error.code === 18 || errorMsg.includes('AuthenticationFailed')) {
      console.error('   [DIAGNOSTIC] Authentication failed.');
      console.error('   → Verify the database username and password in MONGODB_URI.');
      console.error('   → If password contains special characters (@, :, /, %), ensure they are URL-encoded.');
    } else if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('querySrv')) {
      console.error('   [DIAGNOSTIC] DNS lookup failed for cluster hostname.');
      console.error('   → Verify the cluster connection string format from MongoDB Atlas.');
    }

    // Do NOT call process.exit(1) here so the Express HTTP server remains live on Render,
    // allowing Render port binding to succeed and /api/health to report real status.
    return null;
  }
}

module.exports = connectDB;
module.exports.sanitizeMongoUri = sanitizeMongoUri;
module.exports.sanitizeError = sanitizeError;
