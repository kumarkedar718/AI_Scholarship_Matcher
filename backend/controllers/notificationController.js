const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/responseHandler');
const mongoose = require('mongoose');

// @desc    Get paginated user notifications
// @route   GET /api/notifications
// @access  Private (Student)
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, unreadOnly = 'false', type } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 15));

    const query = { recipientId: req.user._id };

    if (unreadOnly === 'true' || unreadOnly === true) {
      query.isRead = false;
    }

    if (type && ['StatusUpdate', 'DeadlineApproaching', 'DeadlineToday', 'NewScholarship', 'System'].includes(type)) {
      query.type = type;
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false
    });

    return sendResponse(res, 200, true, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private (Student)
const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false
    });

    return sendResponse(res, 200, true, 'Unread count retrieved', { unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Student)
const markNotificationAsRead = async (req, res, next) => {
  try {
    const notifId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(notifId)) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    const notification = await Notification.findOne({
      _id: notifId,
      recipientId: req.user._id
    });

    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all unread notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private (Student)
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return sendResponse(
      res,
      200,
      true,
      `Marked ${result.modifiedCount || 0} notifications as read`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single notification
// @route   DELETE /api/notifications/:id
// @access  Private (Student)
const deleteNotification = async (req, res, next) => {
  try {
    const notifId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(notifId)) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    const notification = await Notification.findOne({
      _id: notifId,
      recipientId: req.user._id
    });

    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    await notification.deleteOne();

    return sendResponse(res, 200, true, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all read notifications
// @route   DELETE /api/notifications
// @access  Private (Student)
const clearReadNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({
      recipientId: req.user._id,
      isRead: true
    });

    return sendResponse(
      res,
      200,
      true,
      `Cleared ${result.deletedCount || 0} read notifications`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications
};
