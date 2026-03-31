const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');


router.post('/submit', reviewController.submitReview);
router.get('/:tour_id', reviewController.getReviewsByTour); 
router.delete('/delete', reviewController.deleteReview);

module.exports = router;