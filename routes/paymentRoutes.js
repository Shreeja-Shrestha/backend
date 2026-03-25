const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/initiate-payment", paymentController.initiatePayment);
router.get("/payment-success", paymentController.paymentSuccess);
router.post("/verify-payment", paymentController.verifyPayment);
router.get("/receipt/:booking_id", paymentController.getReceipt);

module.exports = router;