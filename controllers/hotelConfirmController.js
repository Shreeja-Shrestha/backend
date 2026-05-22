const db = require("../config/db");

exports.confirmHotel = (req, res) => {
  const { user_id, tour_id, hotel_name, hotel_lat, hotel_lng } = req.body;

  if (!user_id || !hotel_name || !tour_id) {
    return res.status(400).json({ message: "Missing data" });
  }

  // STEP 1: Check if user already confirmed a hotel for this tour
  const checkSql = `
    SELECT id FROM hotel_confirmations
    WHERE user_id = ? AND tour_id = ?
  `;

  db.query(checkSql, [user_id, tour_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (result.length > 0) {
      // 🔁 UPDATE existing record
      const updateSql = `
        UPDATE hotel_confirmations
        SET hotel_name = ?, hotel_lat = ?, hotel_lng = ?, confirmed_at = NOW()
        WHERE user_id = ? AND tour_id = ?
      `;

      db.query(
        updateSql,
        [hotel_name, hotel_lat, hotel_lng, user_id, tour_id],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ message: "Update failed" });
          }

          return res.json({ message: "Hotel updated successfully" });
        }
      );
    } else {
      // INSERT new record
      const insertSql = `
        INSERT INTO hotel_confirmations
        (user_id, tour_id, hotel_name, hotel_lat, hotel_lng)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [user_id, tour_id, hotel_name, hotel_lat, hotel_lng],
        (err3) => {
          if (err3) {
            console.error(err3);
            return res.status(500).json({ message: "Insert failed" });
          }

          return res.json({ message: "Hotel confirmed successfully" });
        }
      );
    }
  });
};