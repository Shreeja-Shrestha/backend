require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const axios = require("axios");


const app = express();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});


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

const eventRoutes = require('./routes/eventRoutes');
app.use('/', eventRoutes);

const hotelRoutes = require("./routes/hotelRoutes");
app.use("/api", hotelRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

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
app.get("/payment-success", (req, res) => {
  const { status, pidx, transaction_id, amount } = req.query;

  if (status === "Completed") {
    db.query(
      `UPDATE tour_bookings SET 
        payment_status = 'Paid',
        booking_status = 'Confirmed',
        pidx = ?,
        transaction_id = ?,
        amount_paid = ?
       WHERE tour_id = ?`,
      [pidx, transaction_id, amount, 1], // change 1 to actual booking id
      (err) => {
        if (err) return res.send("Database error");
      }
    );

    return res.send("Payment Successful & Booking Confirmed ✅");
  }

  res.send("Payment Failed ❌");
});

app.listen(3000, () => console.log("Server running on port 3000"));
