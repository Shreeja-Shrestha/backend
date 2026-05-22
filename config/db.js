const mysql = require("mysql2");

const dbConfig = {
  host: process.env.MYSQLHOST || "127.0.0.1",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "tourandtravel_db",
  port: process.env.MYSQLPORT || 3306,
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to db:", err.message);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("Database connected.");
    }
  });

  connection.on("error", (err) => {
    console.error("Database error:", err);

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = connection;