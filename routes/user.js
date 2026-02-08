const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET USER PROFILE
router.get("/profile/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT 
      id,
      name,
      email,
      role,
      tagline,
      trips,
      bookings,
      wishlist
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result[0]);
  });
});

module.exports = router;