const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { sendOTPEmail } = require("../services/emailService");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userRole = role ? role : "user";
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, userRole], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }

        return res.status(500).json({
          message: "Database error",
          error: err,
        });
      }

      return res.status(201).json({
        message: "Signup successful",
        role: userRole,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const JWT_SECRET = "secretkey";

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
});

// FORGOT PASSWORD
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    const updateSql =
      "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";

    db.query(updateSql, [otp, expiry, email], async (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: "Error saving OTP" });
      }

      try {
        await sendOTPEmail(email, otp);

        return res.json({
          success: true,
          message: "OTP sent to email",
        });
      } catch (emailError) {
        console.error("Email Error:", emailError);

        return res.status(500).json({
          success: false,
          message: "Failed to send OTP",
        });
      }
    });
  });
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      message: "Email, OTP and new password are required",
    });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters with letters and numbers",
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateSql =
      "UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?";

    db.query(updateSql, [hashedPassword, email], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: "Update failed" });
      }

      return res.json({
        success: true,
        message: "Password reset successful",
      });
    });
  });
});

module.exports = router;