const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

// create booking
router.post("/create", bookingController.createBooking);

// get total bookings for admin dashboard
router.get("/total", bookingController.getTotalBookings);

// get bookings by user
router.get("/user/:userId", bookingController.getUserBookings);

// cancel booking (admin)
router.put("/cancel-admin/:id", bookingController.deleteBooking);

module.exports = router;