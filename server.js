// server.js

const express = require("express");
const app = express();
const PORT = 3000;

// Middleware (to handle JSON)
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
