const { getRedisClient } = require('../config/redis');

const CACHE_TTL = 60 * 60 * 24; 


const setCache = async (shortCode, originalUrl) => {
  try {
    const client = getRedisClient();
    await client.setEx(shortCode, CACHE_TTL, originalUrl);
  } catch (error) {
    console.error('Cache set error:', error.message);
  }
};

const getCache = async (shortCode) => {
  try {
    const client = getRedisClient();
    const value = await client.get(shortCode);
    return value; 
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null; 
  }
};


const deleteCache = async (shortCode) => {
  try {
    const client = getRedisClient();
    await client.del(shortCode);
  } catch (error) {
    console.error('Cache delete error:', error.message);
  }
};

module.exports = { setCache, getCache, deleteCache };