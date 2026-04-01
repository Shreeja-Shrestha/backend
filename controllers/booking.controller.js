const db = require('../config/db');
const axios = require('axios');

// 1. Initiate Payment with Khalti
exports.initiatePayment = (req, res) => {
    const { amount, purchase_order_id, purchase_order_name } = req.body;

    axios.post('https://a.khalti.com/api/v2/epayment/initiate/', {
       "return_url": `http://192.168.18.11:3000/api/payment/payment-success?booking_id=${purchase_order_id}`, // Matches Flutter intent filter
        "website_url": "https://yourwebsite.com",
        "amount": amount * 100,
        "purchase_order_id": purchase_order_id,
        "purchase_order_name": purchase_order_name,
    }, {
        headers: { 'Authorization': 'Key 9e601b866fff445197196b3e7407c2ac' }
    })
    .then(response => res.json(response.data))
    .catch(err => {
        console.error("Khalti Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to initiate payment" });
    });
};
exports.createBooking = (req, res) => {

  const {
    user_id,
    tour_id,
    travel_date,
    number_of_people,
    transport_mode
  } = req.body;

  if (!user_id || !tour_id || !travel_date || !number_of_people || !transport_mode) {
    return res.status(400).json({
      error: "All required fields must be provided"
    });
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
        console.log("DB ERROR:", err);
        return res.status(500).json({
          error: "Booking creation failed",
          details: err.message
        });
      }

      res.json({
        message: "Booking created successfully",
        booking_id: result.insertId
      });

    }
  );
};
exports.getUserBookings = (req, res) => {
  const userId = req.params.userId;

    const sql = `
    SELECT b.*, t.title
    FROM tour_bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE b.user_id = ?
    ORDER BY b.travel_date DESC
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json(rows); // simpler response for Flutter
    });
};

// 4. Cancel/Delete a booking
exports.deleteBooking = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM tour_bookings WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        });
    });
};