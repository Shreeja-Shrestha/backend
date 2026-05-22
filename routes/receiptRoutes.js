const express = require("express");
const router = express.Router();
const receiptController = require("../controllers/receiptController");

// Test route FIRST
router.get("/test", (req, res) => {
  return res.status(200).json({
    message: "Receipt route working"
  });
});

// Get all paid receipts of a user
router.get("/user/:user_id", receiptController.getReceiptsByUser);

// Get single receipt by booking ID
router.get("/:booking_id", receiptController.getReceipt);

module.exports = router;