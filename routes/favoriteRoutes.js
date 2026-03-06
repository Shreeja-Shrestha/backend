const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

router.post("/add", favoriteController.addFavorite);
router.post("/remove", favoriteController.removeFavorite);

module.exports = router;