const express = require("express");
const router = express.Router();
const controller = require("../controllers/hotelConfirmController");

router.post("/confirm", controller.confirmHotel);

module.exports = router;