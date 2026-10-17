const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Static / Named routes (must be defined BEFORE /:id parameterized routes)
router.get('/unread-count', protect, getUnreadCount);
router.patch('/read-all', protect, markAllNotificationsAsRead);
router.delete('/', protect, clearReadNotifications);

// Collection routes
router.get('/', protect, getNotifications);

// Parameterized routes (must be defined AFTER static paths)
router.patch('/:id/read', protect, markNotificationAsRead);
router.put('/:id/read', protect, markNotificationAsRead); // Legacy PUT compatibility
router.delete('/:id', protect, deleteNotification);

module.exports = router;
