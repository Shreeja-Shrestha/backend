const express = require("express");
const router = express.Router();
const db = require("../db"); // your database connection

// POST /api/packages_review/create
router.post("/create", (req, res) => {
  const { user_id, package_id, review_text, rating } = req.body;

  if (!user_id || !package_id || !review_text || !rating) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO package_reviews (user_id, package_id, review_text, rating)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, package_id, review_text, rating], (err, result) => {
    if (err) {
      console.error("Review insert error:", err);
      return res.status(500).json({ message: "Failed to create review" });
    }

    res.status(201).json({
      message: "Review created successfully",
      review_id: result.insertId,
    });
  });
});

module.exports = router; // ✅ MUST export router
