const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.post('/submit', reviewController.submitReview);

module.exports = router;