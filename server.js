const express = require("express");
const app = express();

app.use(express.json()); // VERY IMPORTANT

app.get("/", (req, res) => {
  res.send("Backend is running correctly!");
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
