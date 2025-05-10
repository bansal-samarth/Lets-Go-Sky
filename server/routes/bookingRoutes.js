// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id/cancel', bookingController.cancelBooking);
router.get('/:id/ticket', bookingController.generateTicket);

module.exports = router;