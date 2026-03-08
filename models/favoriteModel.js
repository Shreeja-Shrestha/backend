const db = require("../config/db");


// Add favorite
exports.addFavorite = (userId, tourId, callback) => {
  const sql = "INSERT INTO favorites (user_id, tour_id) VALUES (?, ?)";
  db.query(sql, [userId, tourId], callback);
};

// Remove favorite
exports.removeFavorite = (userId, tourId, callback) => {
  const sql = "DELETE FROM favorites WHERE user_id=? AND tour_id=?";
  db.query(sql, [userId, tourId], callback);
};

// Get user's favorite tour IDs
exports.getUserFavorites = (userId, callback) => {

  const sql = `
  SELECT tours.*
  FROM favorites
  JOIN tours ON favorites.tour_id = tours.id
  WHERE favorites.user_id = ?
  `;

  db.query(sql, [userId], callback);
};