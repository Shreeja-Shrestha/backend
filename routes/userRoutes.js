const express = require("express");
const router = express.Router();
const db = require("../config/db");

///  GET USER PROFILE
router.get("/profile/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT id, name, email, role, tagline, trips, bookings, wishlist
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result[0]);
  });
});


/// UPDATE USER PROFILE
router.put("/update", (req, res) => {
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);

const { id, name, email } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: "User ID required" });
  }

  const sql = `
    UPDATE users 
    SET name = ?, email = ?
    WHERE id = ?
  `;

  db.query(sql, [name, email, id], (err, result) => {
   if (err) {
  console.error("DB ERROR:", err);
  return res.status(500).json({ 
    error: "Database error",
    details: err.message   // 👈 ADD THIS LINE
  });
}

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found or no change" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  });
});

module.exports = router;