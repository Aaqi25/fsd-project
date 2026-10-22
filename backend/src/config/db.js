const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Device = require('../models/Device');
const seedDevices = require('../data/seedDevices');

async function seedInitialData() {
  try {
    // 1. Seed Demo Users if none exist
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

    // 2. Seed Initial Devices if none exist
    const deviceCount = await Device.countDocuments();
    if (deviceCount === 0) {
      await Device.insertMany(seedDevices);
      console.log(`✓ Seeded ${seedDevices.length} initial home appliances into MongoDB`);
    }
  } catch (err) {
    console.warn('Warning: Auto-seeding skipped or encountered error:', err.message);
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: MONGODB_URI environment variable is required in production.');
      process.exit(1);
    }
    console.warn('Warning: MONGODB_URI not provided. Skipping database connection.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    await seedInitialData();
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
}

module.exports = connectDB;
