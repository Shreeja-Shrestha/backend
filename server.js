const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(3000, () => console.log("Server running on port 3000"));
app.get("/test", (req, res) => {
  res.json({ message: "Backend connected successfully" });
});
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});
