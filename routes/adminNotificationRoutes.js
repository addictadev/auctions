
// routes/adminNotificationRoutes.js
const express = require('express');
const adminNotificationController = require('../controllers/adminNotificationController');

const router = express.Router();

router
  .route('/')
  .get(adminNotificationController.getAllNotifications)
  .post(adminNotificationController.createNotification);

router
  .route('/:id')
  .get(adminNotificationController.getNotification)
  .patch(adminNotificationController.updateNotification)
  .delete(adminNotificationController.deleteNotification);

// Endpoint to mark a notification as seen
router.patch('/:id/seen', adminNotificationController.markAllAsSeen);

module.exports = router;