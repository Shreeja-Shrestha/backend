const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Auth and package routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/packages", require("./routes/packageRoutes"));
//app.use("/api/bookings", require("./routes/bookingRoutes"));
const userRoutes = require("./routes/user");

app.use("/api/user", userRoutes);

// const bookingRoutes = require('./routes/bookingRoutes');

// app.use('/api/bookings', bookingRoutes);


// app.use("/api/reviews", require("./routes/packageRoutes"));
// const tourRoutes = require("./routes/tourRoutes");
// app.use("/api/tours", tourRoutes);

// const packageReviewRoutes = require("./routes/packageReviewRoutes");
// app.use("/api/packages_review", packageReviewRoutes); // ✅ path matches Flutter

app.get("/", (req, res) => res.send("API Running"));
app.get("/test", (req, res) => res.json({ message: "Backend connected successfully" }));

// Log all requests (optional)
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.listen(3000, () => console.log("Server running on port 3000"));
