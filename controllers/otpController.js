const db = require("../config/db");
const { sendOTPEmail } = require("../services/emailService");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOTP = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const otp = generateOTP();

  // Remove old OTPs for same email first
  db.query("DELETE FROM email_otps WHERE email = ?", [email], (deleteErr) => {
    if (deleteErr) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    db.query(
      "INSERT INTO email_otps (email, otp, created_at) VALUES (?, ?, NOW())",
      [email, otp],
      async (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        try {
          await sendOTPEmail(email, otp);

          return res.json({
            success: true,
            message: "OTP sent successfully",
          });
        } catch (emailError) {
          return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
          });
        }
      }
    );
  });
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  db.query(
    `
    SELECT * FROM email_otps
    WHERE email = ? AND otp = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [email, otp],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      const otpCreatedAt = new Date(rows[0].created_at);
      const now = new Date();
      const diffMinutes = (now - otpCreatedAt) / 1000 / 60;

      if (diffMinutes > 5) {
        return res.status(400).json({
          success: false,
          message: "OTP expired",
        });
      }

      db.query("DELETE FROM email_otps WHERE email = ?", [email], () => {
        return res.json({
          success: true,
          message: "OTP verified",
        });
      });
    }
  );
};