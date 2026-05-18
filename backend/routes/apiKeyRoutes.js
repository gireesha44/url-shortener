const express = require('express');
const router = express.Router();
const {
  generateApiKey,
  getMyApiKeys,
  revokeApiKey,
} = require('../controllers/apiKeyController');
const { protect } = require('../middleware/auth');

router.post('/', protect, generateApiKey);
router.get('/', protect, getMyApiKeys);
router.delete('/:id', protect, revokeApiKey);

module.exports = router;
