const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

const generateApiKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name for the API key',
      });
    }

    const key = 'ak_' + crypto.randomBytes(24).toString('hex');

    const apiKey = await ApiKey.create({
      key,
      name,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    next(error);
  }
};

const getMyApiKeys = async (req, res, next) => {
  try {
    const apiKeys = await ApiKey.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    next(error);
  }
};

const revokeApiKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKey.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'API Key revoked successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateApiKey,
  getMyApiKeys,
  revokeApiKey,
};
