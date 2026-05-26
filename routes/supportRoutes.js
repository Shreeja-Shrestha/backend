const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST /api/support/report
router.post("/report", (req, res) => {
  const { user_id, issue_type, message } = req.body;

  if (!user_id || !issue_type || !message) {
    return res.status(400).json({
      status: "error",
      message: "user_id, issue_type and message are required",
    });
  }

  // Change this admin ID if your admin user has different id
  const adminUserId = 10;

  const title = "New Support Issue";
  const notificationMessage = `${issue_type}: ${message}`;

  const sql = `
    INSERT INTO notifications
    (user_id, title, message, type, reference_id, is_read)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      adminUserId,
      title,
      notificationMessage,
      "support",
      user_id,
      0,
    ],
    (err, result) => {
      if (err) {
        console.log("SUPPORT NOTIFICATION ERROR:", err);
        return res.status(500).json({
          status: "error",
          message: "Failed to send issue to admin",
          error: err.message,
        });
      }

      res.status(200).json({
        status: "success",
        message: "Issue sent to admin successfully",
        notification_id: result.insertId,
      });
    }
  );
});

module.exports = router;