const db = require('../db');
const bcrypt = require('bcryptjs');

exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(201).json({
      message: "Signup successful",
      userId: result.insertId
    });
  });
};
