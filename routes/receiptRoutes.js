const express = require("express");
const router = express.Router();
const receiptController = require("../controllers/receiptController");

router.get("/receipt/:booking_id", receiptController.getReceipt);

router.get("/receipts/user/:user_id", receiptController.getReceiptsByUser);

module.exports = router;