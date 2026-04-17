const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();//Used to define API routes like /signup, /login
const { sendOTPEmail } = require("../services/emailService");
//SIGNUP 
router.post("/signup", async (req, res) => {//define API endpoint
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

// LOGIN
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
        id: user.id,       // IMPORTANT: use id
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

// FORGOT PASSWORD 


router.post("/forgot-password", async (req, res) => {
  
  const { email } = req.body;
console.log("EMAIL RECEIVED:", email);
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, rows) => {
    console.log("DB RESULT:", rows);
    if (err) return res.status(500).json({ message: "Database error" });

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //  Expiry (5 minutes)
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    const updateSql = "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";

    db.query(updateSql, [otp, expiry, email], async (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: "Error saving OTP" });
      }

      try {
        // Send OTP via email
        await sendOTPEmail(email, otp);

        return res.json({
          success: true,
          message: "OTP sent to email"
        });

      } catch (emailError) {
        console.error("Email Error:", emailError);

        return res.status(500).json({
          success: false,
          message: "Failed to send OTP"
        });
      }
    });
  });
});
// RESET PASSWORD 
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email, otp], async (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (rows.length === 0) {
  return res.status(400).json({ message: "User not found" });
}

const user = rows[0];

/// WRONG OTP
if (user.otp !== otp) {
  return res.status(400).json({ message: "Invalid OTP" });
}

///EXPIRED OTP
if (!user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
  return res.status(400).json({ message: "OTP expired" });
}
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateSql = "UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?";
        db.query(updateSql, [hashedPassword, email], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Update failed" });
      return res.json({ message: "Password reset successful" });
    });
  });
});

module.exports = router; 