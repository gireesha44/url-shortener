const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const { getRedisClient } = require('../config/redis');

const protect = async (req, res, next) => {
  try {
    const apiKeyString = req.headers['x-api-key'] || req.query.apiKey;

    if (apiKeyString) {
      const apiKey = await ApiKey.findOne({ key: apiKeyString, isActive: true });
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or revoked API Key',
        });
      }

      let limitExceeded = false;
      try {
        const client = getRedisClient();
        if (client) {
          const today = new Date().toISOString().split('T')[0];
          const redisKey = `ratelimit:apikey:${apiKeyString}:${today}`;
          const current = await client.incr(redisKey);
          if (current === 1) {
            await client.expire(redisKey, 86400);
          }
          if (current > 100) {
            limitExceeded = true;
          }
        }
      } catch (redisError) {
        console.warn(redisError.message);
      }

      if (limitExceeded) {
        return res.status(429).json({
          success: false,
          message: 'API Key rate limit exceeded (100 req/day)',
        });
      }

      const user = await User.findById(apiKey.user);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User associated with this API Key no longer exists',
        });
      }

      apiKey.lastUsedAt = new Date();
      await apiKey.save();

      req.user = user;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

module.exports = { protect };