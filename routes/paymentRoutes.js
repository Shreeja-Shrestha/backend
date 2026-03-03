const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/initiate-payment", paymentController.initiatePayment);
router.post("/verify-payment", paymentController.verifyPayment);

module.exports = router;