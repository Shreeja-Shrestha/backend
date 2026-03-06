const db = require('../config/db');
const axios = require('axios');

// 1. Initiate Payment with Khalti
exports.initiatePayment = (req, res) => {
    const { amount, purchase_order_id, purchase_order_name } = req.body;

    axios.post('https://a.khalti.com/api/v2/epayment/initiate/', {
        "return_url": "khaltipay://payment-success", // Matches Flutter intent filter
        "website_url": "https://yourwebsite.com",
        "amount": amount,
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
};exports.createBooking = (req, res) => {
  console.log("Incoming Booking Data:", req.body);
  console.log("Booking body:", req.body);
  const {
    user_id,
    tour_id,
    travel_date,
    number_of_people,
    transport_mode
  } = req.body;

  if (!user_id || !tour_id || !travel_date || !number_of_people || !transport_mode) {
    console.log("Missing fields!");
    return res.status(400).json({
      error: "All required fields must be provided"
    });
  }

 const sql = `
INSERT INTO tour_bookings
(user_id, tour_id, travel_date, number_of_people, transport_mode, hotel_id, booking_status, payment_status, amount_paid, payment_method)
VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'Unpaid', 0, 'Khalti')
`;
  db.query(
    sql,
    [user_id, tour_id, travel_date, number_of_people, transport_mode],
    (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);   // 🔥 THIS IS IMPORTANT
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
// 3. Get Bookings for a specific user
exports.getUserBookings = (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM tour_bookings WHERE user_id = ? ORDER BY travel_date DESC";

    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true, bookings: rows });
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