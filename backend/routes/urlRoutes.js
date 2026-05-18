const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  redirectUrl,
  getMyUrls,
  deleteUrl,
  unlockUrl,
  bulkShortenUrl,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const { createUrlLimiter } = require('../middleware/rateLimiter');

router.post('/shorten', protect, createUrlLimiter, createShortUrl);
router.post('/bulk-shorten', protect, createUrlLimiter, bulkShortenUrl);
router.get('/my-urls', protect, getMyUrls);
router.post('/unlock/:shortCode', unlockUrl);
router.delete('/:shortCode', protect, deleteUrl);

module.exports = router;