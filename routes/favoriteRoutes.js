const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

// Add to favorites
router.post("/add", favoriteController.addFavorite);

// Remove from favorites
router.post("/remove", favoriteController.removeFavorite);

// Get user's favorite tours
router.get("/user/:userId", favoriteController.getUserFavorites);
router.get("/count/:userId", favoriteController.getFavoriteCount);
module.exports = router;