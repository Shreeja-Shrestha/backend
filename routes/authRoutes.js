const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// ================== SIGNUP ==================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Default role is 'user' if not provided
    const userRole = role ? role : "user";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB including role
    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, hashedPassword, userRole], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Database error", error: err });
      }
      return res.json({ message: "Signup successful", role: userRole });
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// ================== LOGIN ==================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) return res.status(400).json({ message: "Invalid email" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    // Include role in JWT
    const JWT_SECRET = "secretkey";

    const token = jwt.sign(
      {
        id: user.id,       // ⚠️ IMPORTANT: use id
        email: user.email,
        role: user.role
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
        role: user.role, // important for frontend
      },
    });
  });
});

// ================== FORGOT PASSWORD ==================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const updateSql = "UPDATE users SET otp = ? WHERE email = ?";
    db.query(updateSql, [otp, email], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Error saving OTP" });

      // For testing, we return OTP in response. Later send via email.
      return res.json({ message: "OTP generated", otp });
    });
  });
});

// ================== RESET PASSWORD ==================
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND otp = ?";
  db.query(sql, [email, otp], async (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateSql = "UPDATE users SET password = ?, otp = NULL WHERE email = ?";
    db.query(updateSql, [hashedPassword, email], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Update failed" });
      return res.json({ message: "Password reset successful" });
    });
  });
});

module.exports = router;
