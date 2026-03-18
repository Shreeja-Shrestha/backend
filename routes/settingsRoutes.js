const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

/// GET
router.get("/:user_id", getSettings);

/// UPDATE
router.put("/update", updateSettings);

module.exports = router;