const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");

// specific routes first
router.get("/home", tourController.getHomeTours);

router.get(
  "/category/:category/subcategory/:subcategory",
  tourController.getToursByCategoryAndSubcategory
);

router.get("/category/:category", tourController.getToursByCategory);

// general routes after
router.get("/", tourController.getTours);
router.get("/:id", tourController.getTourById);

router.post("/", tourController.createTour);
router.put("/:id", tourController.updateTour);
router.delete("/:id", tourController.deleteTour);

module.exports = router;