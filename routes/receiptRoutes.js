const express = require("express");
const router = express.Router();
const receiptController = require("../controllers/receiptController");

router.get("/receipt/:booking_id", receiptController.getReceipt);

module.exports = router;