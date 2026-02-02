const db = require("../db");

exports.createBooking = (req, res) => {
  const {
    user_id,
    package_id,
    travel_date,
    persons,
    transport_type,
  } = req.body;

  const sql = `
    INSERT INTO bookings
    (user_id, package_id, travel_date, persons, transport_type)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [user_id, package_id, travel_date, persons, transport_type],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Booking failed" });
      }
      res.status(201).json({
        message: "Booking created successfully",
        booking_id: result.insertId,
      });
    }
  );
};
