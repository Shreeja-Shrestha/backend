const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // your MySQL connection

const router = express.Router();

// ================== SIGNUP ==================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Database error", error: err });
      }
      return res.json({ message: "Signup successful" });
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// ================== LOGIN ==================
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error", err });

      if (rows.length === 0) {
        return res.status(400).json({ message: "Invalid email" });
      }

      const user = rows[0];

      // Compare password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        "secretkey", // replace with env variable in production
        { expiresIn: "1h" }
      );

      return res.json({
        message: "Login successful",
        token,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
