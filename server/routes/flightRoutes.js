
// routes/flightRoutes.js
const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/search', flightController.searchFlights);
router.get('/:id', flightController.getFlightById);

// Protected routes
router.get('/', protect, flightController.getAllFlights);

// Admin routes
router.post('/', protect, admin, flightController.createFlight);

module.exports = router;