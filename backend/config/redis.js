const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Connected');
    });

    await redisClient.connect();
  } catch (error) {
    console.warn(`⚠️ Redis Connection Failed: ${error.message}. Running in DB-only mode.`);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis first.');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };