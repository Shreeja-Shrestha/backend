const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

router.post('/create', bookingController.createBooking);
router.get('/user/:userId', bookingController.getUserBookings);
router.delete('/cancel/:id', bookingController.deleteBooking);

module.exports = router;
