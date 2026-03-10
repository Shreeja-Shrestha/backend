const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

// create booking
router.post("/create", bookingController.createBooking);

// get bookings by user
router.get("/user/:userId", bookingController.getUserBookings);

// cancel booking
router.delete("/cancel/:id", bookingController.deleteBooking);

module.exports = router;