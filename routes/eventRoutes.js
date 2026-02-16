const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/tours/:tourId/events", eventController.getTourEvents);

module.exports = router;
