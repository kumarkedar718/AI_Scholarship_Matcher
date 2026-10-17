const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Scholarship title is required'],
      trim: true,
      index: true
    },
    provider: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    summary: {
      type: String,
      default: ''
    },
    amountText: {
      type: String,
      required: [true, 'Benefit / Amount text is required']
    },
    amountNumeric: {
      type: Number,
      default: 0,
      index: true
    },
    categoryType: {
      type: String,
      enum: ['Merit-Based', 'Need-Based', 'Merit-cum-Means', 'Government', 'Private', 'Special'],
      default: 'Merit-cum-Means'
    },
    deadline: {
      type: Date,
      default: null,
      index: true
    },
    deadlineStatus: {
      type: String,
      enum: ['Open', 'Closing Soon', 'Ongoing', 'Closed', 'Unknown'],
      default: 'Open'
    },
    academicYear: {
      type: String,
      default: '2026-27'
    },
    source: {
      name: { type: String, default: '' },
      url: { type: String, default: '' },
      verifiedAt: { type: String, default: '2026-10-06' }
    },
    officialUrl: {
      type: String,
      required: [true, 'Official application URL is required']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },

    // Deterministic Rule Engine Eligibility Criteria
    eligibilityCriteria: {
      allowedEducationLevels: { type: [String], default: [] }, // Empty array means 'Any'
      allowedCourses: { type: [String], default: [] }, // e.g. ['B.Tech', 'B.Sc']
      allowedBranches: { type: [String], default: [] },
      minCgpa: { type: Number, default: 0 },
      maxFamilyIncome: { type: Number, default: null }, // null means no upper income limit
      allowedStates: { type: [String], default: [] }, // Empty array means 'All India'
      allowedCategories: { type: [String], default: [] }, // Empty array means 'All'
      allowedGenders: { type: [String], default: [] }, // e.g. ['Female'] or empty for 'Any'
      requiresDisability: { type: Boolean, default: false },
      requiresSingleGirlChild: { type: Boolean, default: false }
    },

    requiredDocuments: {
      type: [String],
      default: ['Income Certificate', 'Academic Marksheet', 'Domicile Certificate', 'Identity Proof']
    },

    tags: {
      type: [String],
      default: []
    },

    createdAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Search text index for titles & descriptions
scholarshipSchema.index({ title: 'text', description: 'text', provider: 'text' });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
