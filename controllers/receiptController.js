const db = require("../config/db");

exports.getReceipt = (req, res) => {
  const bookingId = req.params.booking_id;

  const sql = `
    SELECT r.*, t.title, u.name
    FROM receipts r
    JOIN tours t ON r.tour_id = t.id
    JOIN users u ON r.user_id = u.id
    WHERE r.booking_id = ?
  `;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result[0]);
  });
};