const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customCode: {
      type: String,
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    clicks: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    password: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

urlSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $ne: null } } }
);

module.exports = mongoose.model('Url', urlSchema);