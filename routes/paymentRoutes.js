const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/initiate-payment", paymentController.initiatePayment);
router.get("/payment-success", paymentController.paymentSuccess);
router.post("/verify-payment", paymentController.verifyPayment);

module.exports = router;