const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/auth");

// CREATE BOOKING
router.post("/create", authenticateToken, (req, res) => {
  console.log("REQ BODY:", req.body);
console.log("REQ USER:", req.user);
  const { package_id, travel_date, persons, transport_type } = req.body;
  const user_id = req.user.id;

  if (
    package_id == null ||
    !travel_date ||
    persons == null ||
    !transport_type
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO bookings
    (user_id, package_id, travel_date, persons, transport_type)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
  sql,
  [user_id, package_id, travel_date, parseInt(persons), transport_type],
  (err, result) => {
    if (err) {
      console.error("❌ BOOKING MYSQL ERROR:");
      console.error(err);
      console.error("VALUES:", {
        user_id,
        package_id,
        travel_date,
        persons,
        transport_type
      });
      return res.status(500).json({
        message: "Booking failed",
        error: err.sqlMessage || err.message
      });
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking_id: result.insertId,
    });
  }
);
});

module.exports = router;