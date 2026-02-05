const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tour.controller");

router.get("/", tourController.getAllTours);
router.get("/:id", tourController.getTourById);

module.exports = router;