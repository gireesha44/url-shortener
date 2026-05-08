const express = require('express');
const router = express.Router();
const { getUrlAnalytics, getDashboardStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/:shortCode', protect, getUrlAnalytics);

module.exports = router;