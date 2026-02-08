// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// This should just be '/submit' because the prefix is handled in server.js
router.post('/submit', reviewController.submitReview); 

module.exports = router; // Make sure this line exists!