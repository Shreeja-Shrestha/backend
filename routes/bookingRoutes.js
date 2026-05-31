const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");

// create booking
router.post("/create", bookingController.createBooking);

// get total bookings for admin dashboard
router.get("/total", bookingController.getTotalBookings);

// get monthly booking stats for graph
router.get("/monthly-stats", bookingController.getMonthlyBookingStats);

// get bookings by user
router.get("/user/:userId", bookingController.getUserBookings);

// cancel booking by user
router.put("/cancel/:id", bookingController.cancelBooking);

// cancel booking by admin
router.put("/cancel-admin/:id", bookingController.deleteBooking);

module.exports = router;