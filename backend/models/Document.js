const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    documentName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      default: ''
    },
    isVerifiedByUser: {
      type: Boolean,
      default: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Document', documentSchema);
