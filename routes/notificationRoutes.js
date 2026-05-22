const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// ✅ ADMIN route MUST come first
router.get('/admin', notificationController.getAdminNotifications);

// user notifications
router.get('/:userId', notificationController.getNotifications);

// create notification
router.post('/', notificationController.createNotification);

// ✅ mark as read (ONLY THIS ONE)
router.put('/read/:id', notificationController.markAsRead);

module.exports = router;