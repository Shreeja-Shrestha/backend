const favoriteModel = require("../models/favoriteModel");

// Add favorite
exports.addFavorite = (req, res) => {
  const { user_id, tour_id } = req.body;

  if (!user_id || !tour_id) {
    return res.status(400).json({
      status: "error",
      message: "user_id and tour_id are required",
    });
  }

  favoriteModel.addFavorite(user_id, tour_id, (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error or already exists",
      });
    }

    return res.json({
      status: "success",
      message: "Added to favorites",
    });
  });
};
// Remove favorite
exports.removeFavorite = (req, res) => {
  const { user_id, tour_id } = req.body;

  if (!user_id || !tour_id) {
    return res.status(400).json({
      status: "error",
      message: "user_id and tour_id are required",
    });
  }

  favoriteModel.removeFavorite(user_id, tour_id, (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error",
      });
    }

    return res.json({
      status: "success",
      message: "Removed from favorites",
    });
  });
};
// Get user favorites
exports.getUserFavorites = (req, res) => {

  const userId = req.params.userId;

  favoriteModel.getUserFavorites(userId, (err, results) => {

    if (err) {
      return res.json({
        status: "error",
        message: "Database error",
      });
    }

    res.json(results);

  });

};
exports.getFavoriteCount = (req, res) => {
  const userId = req.params.userId;

  favoriteModel.getFavoriteCount(userId, (err, result) => {
    if (err) {
      return res.json({
        status: "error",
        message: "Database error",
      });
    }

    res.json({
      count: result[0].count,
    });
  });
};