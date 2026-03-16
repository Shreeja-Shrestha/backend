const db = require("../config/db");

exports.searchTours = (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({
      message: "Search query is required"
    });
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
    ORDER BY created_at DESC
  `;

  const values = [`%${query}%`, `%${query}%`, `%${query}%`];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Search Controller Error:", err);
      return res.status(500).json({
        message: "Database error"
      });
    }

    res.status(200).json(results);
  });
};