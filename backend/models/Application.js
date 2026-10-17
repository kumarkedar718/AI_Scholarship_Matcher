const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['Saved', 'Applied', 'Under Review', 'Shortlisted', 'Approved', 'Rejected', 'Withdrawn'],
      default: 'Saved',
      index: true
    },
    appliedDate: {
      type: Date
    },
    deadline: {
      type: Date
    },
    notes: {
      type: String,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    remindersSet: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index to prevent duplicate tracker entries for same student and scholarship
applicationSchema.index({ studentId: 1, scholarshipId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
