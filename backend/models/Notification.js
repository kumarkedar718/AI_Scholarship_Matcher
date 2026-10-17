const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: ['StatusUpdate', 'DeadlineApproaching', 'DeadlineToday', 'NewScholarship', 'System'],
      default: 'System',
      index: true
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Application', 'Scholarship', 'System'],
        default: 'System'
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      }
    },
    linkUrl: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    metadata: {
      dateWindow: {
        type: String,
        default: null
      }
    },
    expiresAt: {
      type: Date,
      default: null,
      index: { expires: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Compound Indexes for fast queries & deduplication
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, type: 1, 'relatedEntity.entityId': 1, 'metadata.dateWindow': 1 });

module.exports = mongoose.model('Notification', notificationSchema);
