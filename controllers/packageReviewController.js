const db = require("../db");

// GET reviews
exports.getReviews = (req, res) => {
  const { tourId } = req.params;

  db.query(
    `SELECT r.rating, r.comment, u.name 
     FROM tour_reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.tour_id = ?
     ORDER BY r.created_at DESC`,
    [tourId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// GET average rating
exports.getAverageRating = (req, res) => {
  db.query(
    "SELECT ROUND(AVG(rating),1) AS rating FROM tour_reviews WHERE tour_id = ?",
    [req.params.tourId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0]);
    }
  );
};

// POST review
exports.addReview = (req, res) => {
  const { user_id, tour_id, rating, comment } = req.body;

  db.query(
    "INSERT INTO tour_reviews (user_id, tour_id, rating, comment) VALUES (?,?,?,?)",
    [user_id, tour_id, rating, comment],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
};