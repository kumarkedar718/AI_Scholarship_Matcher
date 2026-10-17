const Notification = require('../models/Notification');
const mongoose = require('mongoose');

/**
 * Core Helper: Create Notification with Deduplication
 */
const createNotification = async ({
  recipientId,
  title,
  message,
  type = 'System',
  relatedEntity = { entityType: 'System', entityId: null },
  linkUrl = '',
  dateWindow = null,
  expiresAt = null
}) => {
  try {
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return null;
    }

    // Deduplication check if related entity exists
    if (relatedEntity && relatedEntity.entityId) {
      const query = {
        recipientId,
        type,
        'relatedEntity.entityId': relatedEntity.entityId
      };
      if (dateWindow) {
        query['metadata.dateWindow'] = dateWindow;
      }

      const existing = await Notification.findOne(query);
      if (existing) {
        return existing; // Duplicate suppressed
      }
    }

    const notification = await Notification.create({
      recipientId,
      title,
      message,
      type,
      relatedEntity,
      linkUrl,
      metadata: { dateWindow: dateWindow || null },
      expiresAt: expiresAt || null
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

/**
 * Helper: Create Status Change Notification
 */
const createStatusNotification = async ({
  studentId,
  scholarshipTitle,
  previousStatus,
  newStatus,
  applicationId
}) => {
  // Only trigger if status actually changed
  if (previousStatus === newStatus) return null;

  return createNotification({
    recipientId: studentId,
    title: 'Application Status Updated',
    message: `Your application for "${scholarshipTitle}" status changed from "${previousStatus}" to "${newStatus}".`,
    type: 'StatusUpdate',
    relatedEntity: {
      entityType: 'Application',
      entityId: applicationId
    },
    linkUrl: '/student/applications'
  });
};

/**
 * Helper: Create Deadline Warning Notification
 */
const createDeadlineNotification = async ({
  studentId,
  scholarshipId,
  scholarshipTitle,
  deadline,
  type = 'DeadlineApproaching',
  dateWindow
}) => {
  const formattedDate = new Date(deadline).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const title = type === 'DeadlineToday' ? 'Application Due Today!' : 'Upcoming Application Deadline';
  const message =
    type === 'DeadlineToday'
      ? `Urgent: Your tracked application for "${scholarshipTitle}" is due TODAY (${formattedDate}).`
      : `Reminder: Application deadline for "${scholarshipTitle}" is approaching on ${formattedDate}.`;

  return createNotification({
    recipientId: studentId,
    title,
    message,
    type,
    relatedEntity: {
      entityType: 'Scholarship',
      entityId: scholarshipId
    },
    linkUrl: `/scholarships/${scholarshipId}`,
    dateWindow
  });
};

/**
 * Helper: Create New Scholarship Notification
 */
const createNewScholarshipNotification = async ({
  studentId,
  scholarshipId,
  scholarshipTitle
}) => {
  return createNotification({
    recipientId: studentId,
    title: 'New Financial Aid Published',
    message: `A new scholarship "${scholarshipTitle}" matching student criteria is now open for applications.`,
    type: 'NewScholarship',
    relatedEntity: {
      entityType: 'Scholarship',
      entityId: scholarshipId
    },
    linkUrl: `/scholarships/${scholarshipId}`
  });
};

module.exports = {
  createNotification,
  createStatusNotification,
  createDeadlineNotification,
  createNewScholarshipNotification
};
