const express = require('express');
const router = express.Router();
const { getUrlAnalytics, getDashboardStats, getHourlyAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/:shortCode/hourly', protect, getHourlyAnalytics);
router.get('/:shortCode', protect, getUrlAnalytics);

module.exports = router;