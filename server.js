require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

const axios = require("axios");
const path = require("path");

app.use("/images", express.static(path.join(__dirname, "public/images")));
console.log("Image path:", path.join(__dirname, "public/images"));

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth",authRoutes);
// Auth and package routes
app.use("/api/packages", require("./routes/packageRoutes"));
//app.use("/api/bookings", require("./routes/bookingRoutes"));
// FIX: Using bookingRoutes.js as the filename
app.use("/api/bookings", require("./routes/bookingRoutes"));

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);
const hotelRoutes = require("./routes/hotelRoutes");
app.use("/api/hotels", hotelRoutes);
const otpRoutes = require("./routes/otpRoutes");
app.use("/api/otp", otpRoutes);

const searchRoutes = require("./routes/searchRoutes");
app.use("/api/search", searchRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const settingsRoutes = require("./routes/settingsRoutes");

app.use("/api/settings", settingsRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);
const favoriteRoutes = require("./routes/favoriteRoutes");
app.use("/api/favorites", favoriteRoutes);

const tourRoutes = require("./routes/tourRoutes");

app.use("/api/tours", tourRoutes);
const receiptRoutes = require("./routes/receiptRoutes");
app.use("/api", receiptRoutes);

const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/notifications', notificationRoutes);

app.get("/", (req, res) => res.send("API Running"));
app.get("/test", (req, res) => res.json({ message: "Backend connected successfully" }));

// Log all requests (optional)
app.get("/nepal-holidays", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/en.np%23holiday%40group.v.calendar.google.com/events",
      {
        params: {
          key: process.env.GOOGLE_API_KEY,
          timeMin: new Date().toISOString(), // only upcoming
          singleEvents: true,
          orderBy: "startTime"
        }
      }
    );

    const holidays = response.data.items.map(event => ({
      title: event.summary,
      date: event.start.date
    }));

    res.json(holidays);

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});
app.get("/booking-success", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Payment Successful</title>
      </head>
      <body style="text-align:center;font-family:sans-serif;margin-top:100px">

        <h2>Payment Successful</h2>
        <p>Your tour booking has been confirmed.</p>

        <button onclick="goHome()" 
        style="padding:10px 20px;font-size:16px;background:green;color:white;border:none;border-radius:5px;">
        Return to Home
        </button>

        <script>
          function goHome(){
            window.location.href="http://172.20.10.2:3000";
          }
        </script>

      </body>
    </html>
  `);
});

app.listen(3000, () => console.log("Server running on port 3000"));
