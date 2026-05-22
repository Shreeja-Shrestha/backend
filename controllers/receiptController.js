const db = require("../config/db");

// Get single receipt
exports.getReceipt = (req, res) => {
  const bookingId = req.params.booking_id;

  const sql = `
    SELECT 
      b.id,
      b.travel_date,
      b.amount_paid,
      b.transaction_id,
      b.payment_method,
      b.payment_date,
      b.payment_status,
      t.title AS tour_name,
      u.name AS user_name
    FROM tour_bookings b
    JOIN tours t ON b.tour_id = t.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result[0]);
  });
};


// Get all receipts of a user
exports.getReceiptsByUser = (req, res) => {
  const userId = req.params.user_id;

  const sql = `
    SELECT 
      b.id,
      b.travel_date,
      b.amount_paid,
      b.payment_status,
      t.title AS tour_name
    FROM tour_bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE b.user_id = ?
    AND b.payment_status = 'Paid'
    ORDER BY b.payment_date DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
};