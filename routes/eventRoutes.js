const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/tours/:id/events', eventController.getEvents);

module.exports = router;
