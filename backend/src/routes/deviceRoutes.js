const express = require('express');
const Device = require('../models/Device');
const seedDevices = require('../data/seedDevices');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply JWT authentication middleware to all device endpoints
router.use(authMiddleware);

/**
 * GET /devices
 * Retrieves all registered devices from MongoDB.
 */
router.get('/', async (req, res) => {
  try {
    let devices = await Device.find().sort({ createdAt: 1 }).lean();

    // Auto-seed if database collection is empty
    if (devices.length === 0) {
      await Device.insertMany(seedDevices);
      devices = await Device.find().sort({ createdAt: 1 }).lean();
    }

    return res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve devices from database.',
    });
  }
});

/**
 * GET /devices/:id
 * Retrieves a single device by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id).lean();
    if (!device) {
      return res.status(404).json({
        success: false,
        message: `Device with ID ${req.params.id} not found.`,
      });
    }
    return res.status(200).json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve device.',
    });
  }
});

/**
 * PATCH /devices/:id/toggle
 * Toggles a device's active/inactive state and persists changes to MongoDB.
 * Body: { status?: 'active' | 'inactive' }
 */
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { status: requestedStatus } = req.body;

    const device = await Device.findById(id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: `Device with ID ${id} not found.`,
      });
    }

    // Determine target status
    const newStatus = requestedStatus || (device.status === 'active' ? 'inactive' : 'active');
    device.status = newStatus;
    device.lastToggledAt = new Date();

    // Persist updated device
    await device.save();

    return res.status(200).json(device.toJSON());
  } catch (error) {
    console.error('Error toggling device status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update device state.',
    });
  }
});

module.exports = router;
