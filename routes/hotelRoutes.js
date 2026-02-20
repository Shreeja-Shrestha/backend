const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

router.get("/nearest-hotel", hotelController.getNearestHotel);

module.exports = router;
