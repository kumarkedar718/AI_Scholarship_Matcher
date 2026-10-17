const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String
    },
    emailVerificationExpires: {
      type: Date
    },
    verificationSessionToken: {
      type: String
    },
    verificationSessionExpires: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    profile: {
      phone: { type: String, default: '' },
      educationLevel: {
        type: String,
        enum: ['Undergraduate', 'Postgraduate', 'Diploma', 'PhD', 'School', ''],
        default: ''
      },
      course: { type: String, default: '' }, // e.g., "B.Tech", "B.Sc", "M.Tech"
      branch: { type: String, default: '' }, // e.g., "Computer Science", "Mechanical"
      currentYear: { type: Number, default: 1 },
      currentSemester: { type: Number, default: 1 },
      cgpaOrPercentage: { type: Number, default: 0 },
      maxCgpaOrScale: { type: Number, default: 10 },
      familyIncomeAnnual: { type: Number, default: 0 },
      stateOfDomicile: { type: String, default: '' },
      category: {
        type: String,
        enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', ''],
        default: ''
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Any', ''],
        default: ''
      },
      isDisability: { type: Boolean, default: false },
      disabilityPercentage: { type: Number, default: 0 },
      isSingleGirlChild: { type: Boolean, default: false },
      isProfileComplete: { type: Boolean, default: false },
      parentIncomeCertificate: {
        url: { type: String, default: '' },
        originalName: { type: String, default: '' },
        mimeType: { type: String, default: '' },
        size: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: null }
      }
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
