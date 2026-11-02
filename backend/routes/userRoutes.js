
const express = require('express');
const { getCustomers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/customers', protect, authorize('admin'), getCustomers);

module.exports = router;
