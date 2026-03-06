const favoriteModel = require("../models/favoriteModel");

exports.addFavorite = (req, res) => {
  const { user_id, tour_id } = req.body;

  favoriteModel.addFavorite(user_id, tour_id, (err, result) => {
    if (err) {
      return res.json({
        status: "error",
        message: "Already added or database error",
      });
    }

    res.json({
      status: "success",
      message: "Added to favorites",
    });
  });
};

exports.removeFavorite = (req, res) => {
  const { user_id, tour_id } = req.body;

  favoriteModel.removeFavorite(user_id, tour_id, (err, result) => {
    if (err) {
      return res.json({
        status: "error",
        message: "Database error",
      });
    }

    res.json({
      status: "success",
      message: "Removed from favorites",
    });
  });
};