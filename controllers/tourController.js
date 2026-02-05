const db = require("../db");

// GET all tours
exports.getAllTours = (req, res) => {
  const sql = "SELECT * FROM tours";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// GET single tour
exports.getTourById = (req, res) => {
  const sql = "SELECT * FROM tours WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0)
      return res.status(404).json({ message: "Tour not found" });

    res.json(results[0]);
  });
};