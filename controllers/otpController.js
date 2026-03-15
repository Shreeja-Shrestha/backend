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
      message: "Email is required"
    });
  }

  const otp = generateOTP();

  db.query(
    "INSERT INTO email_otps (email, otp, created_at) VALUES (?, ?, NOW())",
    [email, otp],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      try {
        await sendOTPEmail(email, otp);

        res.json({
          success: true,
          message: "OTP sent successfully"
        });

      } catch (emailError) {
        console.error(emailError);
        res.status(500).json({
          success: false,
          message: "Failed to send OTP"
        });
      }
    }
  );
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  db.query(
    "SELECT * FROM email_otps WHERE email=? AND otp=? ORDER BY created_at DESC LIMIT 1",
    [email, otp],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP"
        });
      }

      res.json({
        success: true,
        message: "OTP verified"
      });
    }
  );
};