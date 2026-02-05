const router = require("express").Router();
const controller = require("../controllers/review.controller");

router.get("/:tourId", controller.getReviews);
router.get("/avg/:tourId", controller.getAverageRating);
router.post("/", controller.addReview);

module.exports = router;