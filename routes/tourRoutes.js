const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");


/* READ ROUTES */
router.get("/", tourController.getTours);
router.get("/:id", tourController.getTourById);


/* ADMIN CRUD ROUTES */
router.post("/", tourController.createTour);
router.put("/:id", tourController.updateTour);
router.delete("/:id", tourController.deleteTour);


module.exports = router;