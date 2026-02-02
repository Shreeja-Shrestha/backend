const express = require("express");
const router = express.Router();

const {
  addPackage,
  getPackages,
  updatePackage,
  deletePackage
} = require("../controllers/packageController");

router.post("/add", addPackage);
router.get("/", getPackages);
router.put("/update/:id", updatePackage);
router.delete("/delete/:id", deletePackage);

module.exports = router;
