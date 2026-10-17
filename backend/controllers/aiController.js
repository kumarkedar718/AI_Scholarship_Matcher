const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const { evaluateEligibility } = require('../services/eligibilityEngine');
const aiService = require('../services/aiService');
const { sendResponse } = require('../utils/responseHandler');

/**
 * Sanitize AI-extracted filter payload to prevent arbitrary MongoDB operator injection
 */
const sanitizeFilterValue = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    // Strip dollar signs and curly braces to prevent operator injection
    const cleaned = val.replace(/[\$\{\}]/g, '').trim();
    return cleaned.length > 0 ? cleaned : null;
  }
  return null;
};

const sanitizeCriteria = (criteria) => {
  if (!criteria || typeof criteria !== 'object') return {};
  const clean = {};
  for (const [key, val] of Object.entries(criteria)) {
    // Exclude invalid keys
    if (key.startsWith('$') || key.includes('.')) continue;
    clean[key] = sanitizeFilterValue(val);
  }
  return clean;
};

// @desc    Get AI-Assisted personalized scholarship recommendations
// @route   GET /api/ai/recommendations
// @access  Private (Student)
const getAIRecommendations = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student || !student.profile) {
      return sendResponse(res, 400, false, 'Please complete your student profile first to get AI recommendations');
    }

    const scholarships = await Scholarship.find({ isActive: true });

    const eligibleMatches = [];
    const needsVerificationMatches = [];

    for (const scholarship of scholarships) {
      const evaluation = evaluateEligibility(student.profile, scholarship.eligibilityCriteria);

      if (evaluation.status === 'Eligible') {
        eligibleMatches.push({ scholarship, evaluation });
      } else if (evaluation.status === 'Needs Verification') {
        needsVerificationMatches.push({ scholarship, evaluation });
      }
    }

    const rankFn = (a, b) => {
      if (b.evaluation.matchPercentage !== a.evaluation.matchPercentage) {
        return b.evaluation.matchPercentage - a.evaluation.matchPercentage;
      }
      const deadlineA = new Date(a.scholarship.deadline).getTime();
      const deadlineB = new Date(b.scholarship.deadline).getTime();
      if (deadlineA !== deadlineB) {
        return deadlineA - deadlineB;
      }
      return (b.scholarship.amountNumeric || 0) - (a.scholarship.amountNumeric || 0);
    };

    eligibleMatches.sort(rankFn);
    needsVerificationMatches.sort(rankFn);

    const topEligible = eligibleMatches.slice(0, 6);
    const topNeedsVerification = needsVerificationMatches.slice(0, 3);

    const isLiveAI = Boolean(aiService.provider && aiService.apiKey);
    const providerLabel = isLiveAI ? 'AI Recommendation' : 'Smart Rule-Based Recommendation';

    const recommendations = await Promise.all(
      topEligible.map(async (item) => {
        const aiReason = await aiService.getRecommendationReason(
          student.profile,
          item.scholarship,
          item.evaluation
        );

        return {
          scholarship: item.scholarship,
          eligibilityStatus: item.evaluation.status,
          matchPercentage: item.evaluation.matchPercentage,
          recommendationReason: aiReason,
          matchedHighlights: item.evaluation.matchedCriteria,
          importantConsiderations: item.evaluation.missingCriteria,
          deadline: item.scholarship.deadline,
          award: item.scholarship.amountText
        };
      })
    );

    const verificationRecommendations = await Promise.all(
      topNeedsVerification.map(async (item) => {
        const aiReason = await aiService.getRecommendationReason(
          student.profile,
          item.scholarship,
          item.evaluation
        );

        return {
          scholarship: item.scholarship,
          eligibilityStatus: item.evaluation.status,
          matchPercentage: item.evaluation.matchPercentage,
          recommendationReason: aiReason,
          matchedHighlights: item.evaluation.matchedCriteria,
          importantConsiderations: item.evaluation.missingCriteria,
          deadline: item.scholarship.deadline,
          award: item.scholarship.amountText
        };
      })
    );

    return sendResponse(res, 200, true, 'Recommendations generated successfully', {
      aiStatus: {
        isLiveAI,
        provider: isLiveAI ? 'gemini' : 'smart_rule_fallback',
        label: providerLabel
      },
      summary: {
        totalActiveEvaluated: scholarships.length,
        eligibleCount: eligibleMatches.length,
        needsVerificationCount: needsVerificationMatches.length
      },
      recommendations,
      needsVerificationRecommendations: verificationRecommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Natural Language Scholarship Search (Database-First with AI Parsing & Rule Engine)
// @route   POST /api/scholarships/natural-search
// @route   POST /api/ai/natural-search
// @access  Private (Student)
const naturalLanguageSearch = async (req, res, next) => {
  try {
    const { query } = req.body;

    // 1. Validate query
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return sendResponse(res, 400, false, 'Natural language search query is required');
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3 || trimmedQuery.length > 500) {
      return sendResponse(
        res,
        400,
        false,
        'Query length must be between 3 and 500 characters.'
      );
    }

    // 2. Parse natural language query into structured filters (AI with fallback)
    const rawExtractedCriteria = await aiService.parseNaturalLanguageQuery(trimmedQuery);
    const extractedCriteria = sanitizeCriteria(rawExtractedCriteria);

    // Check if any filter parameter was recognized
    const hasRecognizedFilter = Object.values(extractedCriteria).some((val) => val !== null);

    // 3. Construct safe MongoDB query
    const dbQuery = { isActive: true };
    const andConds = [];

    if (extractedCriteria.educationLevel) {
      andConds.push({
        $or: [
          { 'eligibilityCriteria.allowedEducationLevels': { $size: 0 } },
          { 'eligibilityCriteria.allowedEducationLevels': { $regex: new RegExp(extractedCriteria.educationLevel, 'i') } }
        ]
      });
    }

    if (extractedCriteria.course) {
      andConds.push({
        $or: [
          { 'eligibilityCriteria.allowedCourses': { $size: 0 } },
          { 'eligibilityCriteria.allowedCourses': { $regex: new RegExp(extractedCriteria.course, 'i') } }
        ]
      });
    }

    if (extractedCriteria.branch) {
      andConds.push({
        $or: [
          { 'eligibilityCriteria.allowedBranches': { $size: 0 } },
          { 'eligibilityCriteria.allowedBranches': { $regex: new RegExp(extractedCriteria.branch, 'i') } }
        ]
      });
    }

    if (extractedCriteria.stateOfDomicile) {
      andConds.push({
        $or: [
          { 'eligibilityCriteria.allowedStates': { $size: 0 } },
          { 'eligibilityCriteria.allowedStates': { $regex: new RegExp(extractedCriteria.stateOfDomicile, 'i') } }
        ]
      });
    }

    if (extractedCriteria.category) {
      andConds.push({
        $or: [
          { 'eligibilityCriteria.allowedCategories': { $size: 0 } },
          { 'eligibilityCriteria.allowedCategories': { $regex: new RegExp(extractedCriteria.category, 'i') } }
        ]
      });
    }

    if (extractedCriteria.gender) {
      andConds.push({
        $or: [
          { 'eligibilityCriteria.allowedGenders': { $size: 0 } },
          { 'eligibilityCriteria.allowedGenders': 'Any' },
          { 'eligibilityCriteria.allowedGenders': { $regex: new RegExp(extractedCriteria.gender, 'i') } }
        ]
      });
    }

    if (extractedCriteria.categoryType) {
      andConds.push({ categoryType: extractedCriteria.categoryType });
    }

    if (andConds.length > 0) {
      dbQuery.$and = andConds;
    }

    // 4. Fetch candidate scholarships from MongoDB (Database-First)
    const candidateScholarships = await Scholarship.find(dbQuery).limit(50);

    // 5. Fetch authenticated student profile to combine with query filters
    let studentProfile = {};
    if (req.user && req.user._id) {
      const studentUser = await User.findById(req.user._id);
      if (studentUser && studentUser.profile) {
        studentProfile = studentUser.profile.toObject ? studentUser.profile.toObject() : studentUser.profile;
      }
    }

    // Merge student profile with query extracted criteria (query criteria take precedence)
    const evaluationProfile = {
      ...studentProfile,
      educationLevel: extractedCriteria.educationLevel || studentProfile.educationLevel || '',
      course: extractedCriteria.course || studentProfile.course || '',
      branch: extractedCriteria.branch || studentProfile.branch || '',
      stateOfDomicile: extractedCriteria.stateOfDomicile || studentProfile.stateOfDomicile || '',
      category: extractedCriteria.category || studentProfile.category || '',
      gender: extractedCriteria.gender || studentProfile.gender || '',
      familyIncomeAnnual: extractedCriteria.familyIncomeAnnual !== null && extractedCriteria.familyIncomeAnnual !== undefined
        ? extractedCriteria.familyIncomeAnnual
        : studentProfile.familyIncomeAnnual || 0,
      cgpaOrPercentage: extractedCriteria.cgpaOrPercentage !== null && extractedCriteria.cgpaOrPercentage !== undefined
        ? extractedCriteria.cgpaOrPercentage
        : studentProfile.cgpaOrPercentage || 0
    };

    // 6. Integrate Existing Eligibility Engine
    const evaluatedResults = candidateScholarships.map((scholarship) => {
      const evaluation = evaluateEligibility(evaluationProfile, scholarship.eligibilityCriteria);

      // Construct transparent factual matching explanation
      const matchedDetails = evaluation.matchedCriteria.map((m) => m.detail);
      const matchedBecause = matchedDetails.length > 0
        ? `Matched because: ${matchedDetails.join('; ')}.`
        : evaluation.explanation || 'Scholarship criteria evaluated.';

      return {
        scholarship,
        matchScore: evaluation.score,
        matchPercentage: evaluation.matchPercentage,
        eligibilityStatus: evaluation.status,
        matchedCriteria: evaluation.matchedCriteria,
        unmatchedCriteria: evaluation.unmatchedCriteria,
        missingCriteria: evaluation.missingCriteria,
        matchedBecause
      };
    });

    // Sort by match score descending
    evaluatedResults.sort((a, b) => b.matchScore - a.matchScore);

    // Handle completely unrecognized query fallback message
    if (!hasRecognizedFilter && evaluatedResults.length === 0) {
      return sendResponse(
        res,
        200,
        true,
        "Sorry, I couldn't understand the scholarship criteria. Try mentioning your degree, field, state, category, or family income.",
        {
          query: trimmedQuery,
          parsedFilters: extractedCriteria,
          totalMatches: 0,
          scholarships: [],
          results: []
        }
      );
    }

    return sendResponse(res, 200, true, 'Natural language search processed successfully', {
      query: trimmedQuery,
      parsedFilters: extractedCriteria,
      totalMatches: evaluatedResults.length,
      scholarships: evaluatedResults,
      results: evaluatedResults // Backwards compatibility for existing components
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed AI explanation for single scholarship
// @route   GET /api/ai/explain/:scholarshipId
// @access  Private (Student)
const explainScholarshipMatch = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.scholarshipId);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    const student = await User.findById(req.user._id);
    const evaluation = evaluateEligibility(student.profile, scholarship.eligibilityCriteria);
    const aiReason = await aiService.getRecommendationReason(student.profile, scholarship, evaluation);

    return sendResponse(res, 200, true, 'AI Match explanation generated', {
      scholarship,
      matchScore: evaluation.score,
      matchPercentage: evaluation.matchPercentage,
      status: evaluation.status,
      matchedCriteria: evaluation.matchedCriteria,
      unmatchedCriteria: evaluation.unmatchedCriteria,
      missingCriteria: evaluation.missingCriteria,
      requiredDocuments: scholarship.requiredDocuments,
      aiExplanation: aiReason,
      deadline: scholarship.deadline
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-generated short summary of scholarship
// @route   GET /api/ai/summary/:scholarshipId
// @access  Public
const summarizeScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.scholarshipId);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    if (scholarship.summary && scholarship.summary.trim() !== '') {
      return sendResponse(res, 200, true, 'Scholarship summary retrieved', { summary: scholarship.summary });
    }

    const aiSummary = await aiService.getSummary(scholarship.description);

    return sendResponse(res, 200, true, 'AI summary generated', { summary: aiSummary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAIRecommendations,
  naturalLanguageSearch,
  explainScholarshipMatch,
  summarizeScholarship
};
