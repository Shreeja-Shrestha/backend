const db = require("../config/db");

exports.searchTours = (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(200).json([]); // 🔥 don't break UI
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

  const value = `%${query}%`;

  db.query(sql, [value, value, value, value], (err, results) => {
    if (err) {
      console.error("Search Controller Error:", err);
      return res.status(500).json({
        message: "Database error"
      });
    }

    // KEY UPGRADE: fallback if empty
    if (results.length === 0) {
      const fallbackSql = `
        SELECT * FROM tours
        ORDER BY created_at DESC
        LIMIT 5
      `;

      return db.query(fallbackSql, (err, fallbackResults) => {
        if (err) {
          return res.status(500).json({ message: "Fallback error" });
        }

        return res.status(200).json({
          fallback: true,
          data: fallbackResults
        });
      });
    }

    res.status(200).json({
      fallback: false,
      data: results
    });
  });
};