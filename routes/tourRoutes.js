const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");

router.get("/", tourController.getTours);
router.get("/:id", tourController.getTourById);

/* ADD THESE */
router.post("/", tourController.createTour);
router.put("/:id", tourController.updateTour);
router.delete("/:id", tourController.deleteTour);
router.get("/category/:category", tourController.getToursByCategory);
module.exports = router;