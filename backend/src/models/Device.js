const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    homeId: {
      type: String,
      default: 'home_001',
    },
    roomId: {
      type: String,
      required: [true, 'Room ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['light', 'fan', 'ac', 'smart_plug', 'sensor', 'heater', 'camera'],
      default: 'light',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    powerWatts: {
      type: Number,
      default: 0,
    },
    currentUsageKwh: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
      default: '192.168.1.100',
    },
    firmware: {
      type: String,
      default: 'v2.4.1 (Latest)',
    },
    model: {
      type: String,
      default: 'SmartHome Device',
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastToggledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Device', deviceSchema);
