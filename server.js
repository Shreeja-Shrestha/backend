require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const axios = require("axios");


const app = express();

app.use(cors());
app.use(express.json());

// Auth and package routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/packages", require("./routes/packageRoutes"));
//app.use("/api/bookings", require("./routes/bookingRoutes"));
const userRoutes = require("./routes/user");

app.use("/api/user", userRoutes);
// FIX: Using bookingRoutes.js as the filename
app.use("/api/bookings", require("./routes/bookingRoutes"));

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);


app.get("/", (req, res) => res.send("API Running"));
app.get("/test", (req, res) => res.json({ message: "Backend connected successfully" }));

// Log all requests (optional)
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.listen(3000, () => console.log("Server running on port 3000"));
