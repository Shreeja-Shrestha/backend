const db = require("../config/db");

exports.searchTours = (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === "") {
    return res.status(200).json([]);
  }

  const sql = `
    SELECT 
      id,
      title,
      destination,
      price,
      duration,
      category,
      description,
      image,
      created_at
    FROM tours
    WHERE title LIKE ?
    OR destination LIKE ?
    OR category LIKE ?
    OR description LIKE ?
    ORDER BY created_at DESC
  `;

  const value = `%${query.trim()}%`;

  db.query(sql, [value, value, value, value], (err, results) => {
    if (err) {
      console.error("Search Controller Error:", err);
      return res.status(500).json({
        message: "Database error",
        error: err.message
      });
    }

    return res.status(200).json(results);
  });
};