const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const { evaluateEligibility } = require('../services/eligibilityEngine');
const { sendResponse } = require('../utils/responseHandler');

// @desc    Evaluate student eligibility for a specific scholarship
// @route   GET /api/eligibility/evaluate/:scholarshipId
// @access  Private (Student)
const evaluateSingleScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.scholarshipId);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    const student = await User.findById(req.user._id);
    const evaluation = evaluateEligibility(student.profile, scholarship.eligibilityCriteria);

    return sendResponse(res, 200, true, 'Eligibility evaluation completed', {
      scholarshipId: scholarship._id,
      scholarshipTitle: scholarship.title,
      evaluation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch evaluate all scholarships for logged-in student
// @route   GET /api/eligibility/my-matches
// @access  Private (Student)
const getEligibleScholarshipsForStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    const scholarships = await Scholarship.find({ isActive: true });

    const results = scholarships.map((scholarship) => {
      const evaluation = evaluateEligibility(student.profile, scholarship.eligibilityCriteria);
      return {
        scholarship,
        evaluation
      };
    });

    // Group into Eligible, Needs Verification, and Not Eligible
    const eligible = results.filter((r) => r.evaluation.status === 'Eligible');
    const needsVerification = results.filter((r) => r.evaluation.status === 'Needs Verification');
    const notEligible = results.filter((r) => r.evaluation.status === 'Not Eligible');

    return sendResponse(res, 200, true, 'Student eligible scholarships evaluated', {
      summary: {
        totalActive: scholarships.length,
        eligibleCount: eligible.length,
        needsVerificationCount: needsVerification.length,
        notEligibleCount: notEligible.length
      },
      eligible,
      needsVerification,
      notEligible
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  evaluateSingleScholarship,
  getEligibleScholarshipsForStudent
};
