const db = require("../config/db");

// CREATE BOOKING
exports.createBooking = (req, res) => {
  const {
    user_id,
    tour_id,
    travel_date,
    number_of_people,
    transport_mode,
  } = req.body;

  if (!user_id || !tour_id || !travel_date || !number_of_people || !transport_mode) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO tour_bookings
    (user_id, tour_id, travel_date, number_of_people, transport_mode, booking_status, payment_status, amount_paid, payment_method)
    VALUES (?, ?, ?, ?, ?, 'Pending', 'Unpaid', 0, 'Khalti')
  `;

  db.query(
    sql,
    [user_id, tour_id, travel_date, number_of_people, transport_mode],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.status(201).json({
        message: "Booking created successfully",
        booking_id: result.insertId,
      });
    }
  );
};

// GET BOOKINGS BY USER
exports.getUserBookings = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      b.*,
      t.title,
      t.destination,
      t.image,
      t.price,
      t.duration
    FROM tour_bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.json(result);
  });
};

// GET BOOKING BY ID
exports.getBookingById = (req, res) => {
  const bookingId = req.params.id;

  const sql = `
    SELECT 
      b.*,
      t.title,
      t.destination,
      t.image,
      t.price,
      t.duration
    FROM tour_bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE b.id = ?
  `;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(result[0]);
  });
};

// CANCEL BOOKING
exports.cancelBooking = (req, res) => {
  const bookingId = req.params.id;

  const sql = `
    UPDATE tour_bookings
    SET booking_status = 'Cancelled'
    WHERE id = ?
  `;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking cancelled successfully" });
  });
};

// DELETE BOOKING
exports.deleteBooking = (req, res) => {
  const bookingId = req.params.id;

  const sql = "DELETE FROM tour_bookings WHERE id = ?";

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  });
};