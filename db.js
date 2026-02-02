const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "tourandtravel_db",
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    return;
  }
  console.log("✅ MySQL Connected to tourandtravel_db");
});

module.exports = db;