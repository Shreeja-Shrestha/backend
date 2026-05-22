const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventController");

router.get("/", controller.getEvents);

module.exports = router;