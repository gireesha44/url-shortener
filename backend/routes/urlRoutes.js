const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  redirectUrl,
  getMyUrls,
  deleteUrl,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const { createUrlLimiter } = require('../middleware/rateLimiter');

router.post('/shorten', protect, createUrlLimiter, createShortUrl);
router.get('/my-urls', protect, getMyUrls);
router.delete('/:shortCode', protect, deleteUrl);

module.exports = router;