// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/wallet', protect, userController.getWalletBalance);
router.put('/wallet', protect, userController.updateWalletBalance);

module.exports = router;