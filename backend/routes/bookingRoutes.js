const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate); // All booking routes require authentication

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.listUserBookings);
router.get('/all', bookingController.listAllBookings); // Organizer/Admin feature

module.exports = router;
