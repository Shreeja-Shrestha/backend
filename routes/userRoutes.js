const express = require("express");
const router = express.Router();
const db = require("../config/db");
router.get("/total", (req, res) => {

  const sql = "SELECT COUNT(*) AS total FROM users";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      total: result[0].total
    });
  });
});
///  GET USER PROFILE
router.get("/profile/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.tagline,
      u.trips,
      u.bookings,
      COUNT(f.id) AS wishlist
    FROM users u
    LEFT JOIN favorites f ON u.id = f.user_id
    WHERE u.id = ?
    GROUP BY u.id
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
  
const { id, name, email, tagline } = req.body || {};  if (!id) {
    return res.status(400).json({ error: "User ID required" });
  }

  const sql = `
    UPDATE users 
    SET name = ?, email = ?,tagline=?
    WHERE id = ?
  `;

  db.query(sql, [name, email,tagline, id], (err, result) => {
   if (err) {
  console.error("DB ERROR:", err);
  return res.status(500).json({ 
    error: "Database error",
    details: err.message   //  ADD THIS LINE
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
router.post("/interests/:id", (req, res) => {
  const userId = req.params.id;

  const interests = req.body.interests;

  if (!Array.isArray(interests)) {
    return res.status(400).json({ message: "Invalid interests format" });
  }

  const interestString = interests.join(",");

  const sql = "UPDATE users SET interests = ? WHERE id = ?";

  db.query(sql, [interestString, userId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Interests updated successfully" });
  });
});
router.get("/interests/:id", (req, res) => {
  const userId = req.params.id;

  const sql = "SELECT interests FROM users WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const interests =
      result[0].interests ? result[0].interests.split(",") : [];

    res.json(interests);
  });
});
// =========================
// GET TOTAL USERS (ADMIN)
// =========================
// =========================
// GET ALL USERS (ADMIN)
// =========================
router.get("/", (req, res) => {
  const sql = `
    SELECT id, name, email, role
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });
});
module.exports = router;