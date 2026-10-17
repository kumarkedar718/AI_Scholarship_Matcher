const Scholarship = require('../models/Scholarship');
const { sendResponse } = require('../utils/responseHandler');
const { validateScholarshipInput } = require('../validators/scholarshipValidator');

// @desc    Get all active scholarships (with search, filtering, and pagination)
// @route   GET /api/scholarships
// @access  Public
const getScholarships = async (req, res, next) => {
  try {
    const {
      search,
      categoryType,
      educationLevel,
      state,
      category,
      maxIncome,
      sortBy = 'deadline',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
      includeInactive = false
    } = req.query;

    const query = {};
    const andConditions = [];

    // Filter by active status unless requested by admin
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    // Text search query
    if (search && search.trim() !== '') {
      andConditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { provider: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Category Type filter
    if (categoryType && categoryType !== 'All') {
      query.categoryType = categoryType;
    }

    // Education Level filter
    if (educationLevel && educationLevel !== 'All') {
      andConditions.push({
        $or: [
          { 'eligibilityCriteria.allowedEducationLevels': { $size: 0 } },
          { 'eligibilityCriteria.allowedEducationLevels': educationLevel }
        ]
      });
    }

    // State filter
    if (state && state !== 'All') {
      andConditions.push({
        $or: [
          { 'eligibilityCriteria.allowedStates': { $size: 0 } },
          { 'eligibilityCriteria.allowedStates': state }
        ]
      });
    }

    // Caste / Social Category filter
    if (category && category !== 'All') {
      andConditions.push({
        $or: [
          { 'eligibilityCriteria.allowedCategories': { $size: 0 } },
          { 'eligibilityCriteria.allowedCategories': category }
        ]
      });
    }

    // Maximum income upper cap filter
    if (maxIncome && !isNaN(maxIncome)) {
      const incomeVal = Number(maxIncome);
      andConditions.push({
        $or: [
          { 'eligibilityCriteria.maxFamilyIncome': null },
          { 'eligibilityCriteria.maxFamilyIncome': { $gte: incomeVal } }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Sorting
    const sort = {};
    if (sortBy === 'deadline') {
      sort.deadline = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'amount') {
      sort.amountNumeric = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'title') {
      sort.title = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Scholarship.countDocuments(query);
    const scholarships = await Scholarship.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    return sendResponse(res, 200, true, 'Scholarships retrieved successfully', {
      scholarships,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single scholarship by ID
// @route   GET /api/scholarships/:id
// @access  Public
const getScholarshipById = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }
    return sendResponse(res, 200, true, 'Scholarship details retrieved', scholarship);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new scholarship (Admin)
// @route   POST /api/scholarships
// @access  Private (Admin)
const createScholarship = async (req, res, next) => {
  try {
    const { isValid, errors } = validateScholarshipInput(req.body);
    if (!isValid) {
      return sendResponse(res, 400, false, 'Validation Failed', null, errors);
    }

    const scholarshipData = {
      ...req.body,
      createdAdminId: req.user._id
    };

    const scholarship = await Scholarship.create(scholarshipData);

    // Broadcast NewScholarship notification asynchronously to active students
    if (scholarship.isActive) {
      const User = require('../models/User');
      const { createNewScholarshipNotification } = require('../services/notificationService');
      const students = await User.find({ role: 'student', isEmailVerified: true }).select('_id');
      for (const s of students) {
        createNewScholarshipNotification({
          studentId: s._id,
          scholarshipId: scholarship._id,
          scholarshipTitle: scholarship.title
        }).catch((e) => console.error('Failed to create new scholarship notification:', e.message));
      }
    }

    return sendResponse(res, 201, true, 'Scholarship created successfully', scholarship);
  } catch (error) {
    next(error);
  }
};

// @desc    Update scholarship (Admin)
// @route   PUT /api/scholarships/:id
// @access  Private (Admin)
const updateScholarship = async (req, res, next) => {
  try {
    let scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    return sendResponse(res, 200, true, 'Scholarship updated successfully', scholarship);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scholarship (Admin)
// @route   DELETE /api/scholarships/:id
// @access  Private (Admin)
const deleteScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    await scholarship.deleteOne();
    return sendResponse(res, 200, true, 'Scholarship deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle scholarship active / inactive status (Admin)
// @route   PATCH /api/scholarships/:id/toggle
// @access  Private (Admin)
const toggleScholarshipStatus = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    scholarship.isActive = !scholarship.isActive;
    await scholarship.save();

    return sendResponse(
      res,
      200,
      true,
      `Scholarship status updated to ${scholarship.isActive ? 'Active' : 'Inactive'}`,
      scholarship
    );
  } catch (error) {
    next(error);
  }
};

const { naturalLanguageSearch } = require('./aiController');

module.exports = {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  toggleScholarshipStatus,
  naturalLanguageSearch
};
