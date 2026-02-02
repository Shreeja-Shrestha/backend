const db = require("../db");

exports.createReview = async (req, res) => {
  const { user_id, package_id, review_text, rating } = req.body;
  try {
    await db.query(
      "INSERT INTO package_reviews (user_id, package_id, review_text, rating) VALUES (?, ?, ?, ?)",
      [user_id, package_id, review_text, rating]
    );
    res.status(201).json({ message: "Review created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
