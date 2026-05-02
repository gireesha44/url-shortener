const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },

    shortCode: {
      type: String,
      required: true,
      index: true,
    },

    ipAddress: {
      type: String,
      default: 'unknown',
    },

    country: {
      type: String,
      default: 'unknown',
    },

    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },

    browser: {
      type: String,
      default: 'unknown',
    },

    referrer: {
      type: String,
      default: 'direct',
    },

    clickedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

module.exports = mongoose.model('Analytics', analyticsSchema);