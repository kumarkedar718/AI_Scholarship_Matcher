const mongoose = require('mongoose');

const savedScholarshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
      required: true,
      index: true
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

savedScholarshipSchema.index({ studentId: 1, scholarshipId: 1 }, { unique: true });

module.exports = mongoose.model('SavedScholarship', savedScholarshipSchema);
