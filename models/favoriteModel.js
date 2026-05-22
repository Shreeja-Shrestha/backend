const db = require("../config/db");


// Add favorite
exports.addFavorite = (userId, tourId, callback) => {
  const checkSql = "SELECT * FROM favorites WHERE user_id=? AND tour_id=?";

  db.query(checkSql, [userId, tourId], (err, result) => {
    if (err) return callback(err);

    if (result.length > 0) {
      return callback(new Error("Already exists"));
    }

    const sql = "INSERT INTO favorites (user_id, tour_id) VALUES (?, ?)";
    db.query(sql, [userId, tourId], callback);
  });
};
// Remove favorite
exports.removeFavorite = (userId, tourId, callback) => {
  const sql = "DELETE FROM favorites WHERE user_id=? AND tour_id=?";
  db.query(sql, [userId, tourId], callback);
};

// Get user's favorite tour IDs
exports.getFavoriteCount = (userId, callback) => {
  const sql = "SELECT COUNT(*) AS count FROM favorites WHERE user_id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) return callback(err, null);

    return callback(null, results);
  });
};
exports.getUserFavorites = (userId, callback) => {
  const sql = `
    SELECT f.id, t.id AS tour_id, t.title, t.destination, t.image
    FROM favorites f
    JOIN tours t ON f.tour_id = t.id
    WHERE f.user_id = ?
  `;

  db.query(sql, [userId], callback);
};