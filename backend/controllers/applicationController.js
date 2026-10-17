const SavedScholarship = require('../models/SavedScholarship');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const { sendResponse } = require('../utils/responseHandler');
const { createStatusNotification } = require('../services/notificationService');
const mongoose = require('mongoose');

/**
 * Status Normalizer: Maps flexible human or snake_case status strings to exact Mongoose Enum values
 */
const normalizeStatus = (inputStatus) => {
  if (!inputStatus || typeof inputStatus !== 'string') return null;
  const s = inputStatus.trim().toLowerCase().replace(/_/g, ' ');
  if (s === 'saved') return 'Saved';
  if (s === 'applied') return 'Applied';
  if (s === 'under review') return 'Under Review';
  if (s === 'shortlisted') return 'Shortlisted';
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  if (s === 'withdrawn') return 'Withdrawn';
  if (s === 'planning to apply') return 'Saved';
  return null;
};

// @desc    Create / save a new scholarship application tracker entry
// @route   POST /api/applications
// @access  Private (Student)
const createApplication = async (req, res, next) => {
  try {
    const body = req.body || {};
    const rawScholarshipId = body.scholarshipId || body.scholarship;
    const rawStatus = body.status || 'Saved';
    const notes = body.notes ? String(body.notes).trim() : '';
    const rawAppliedDate = body.appliedDate || body.applicationDate;
    const rawDeadline = body.deadline;

    if (!rawScholarshipId) {
      return sendResponse(res, 400, false, 'Scholarship ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(rawScholarshipId)) {
      return sendResponse(res, 400, false, 'Invalid Scholarship ID format');
    }

    const status = normalizeStatus(rawStatus);
    if (!status) {
      return sendResponse(
        res,
        400,
        false,
        'Invalid status. Must be one of: Saved, Applied, Under Review, Shortlisted, Approved, Rejected, Withdrawn'
      );
    }

    if (notes.length > 1000) {
      return sendResponse(res, 400, false, 'Notes cannot exceed 1000 characters');
    }

    const scholarship = await Scholarship.findById(rawScholarshipId);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    // Check duplicate compound index (studentId + scholarshipId)
    const existing = await Application.findOne({
      studentId: req.user._id,
      scholarshipId: rawScholarshipId
    });

    if (existing) {
      return sendResponse(
        res,
        400,
        false,
        'Scholarship is already being tracked in your application tracker'
      );
    }

    let appliedDate = null;
    if (rawAppliedDate) {
      appliedDate = new Date(rawAppliedDate);
      if (isNaN(appliedDate.getTime())) {
        return sendResponse(res, 400, false, 'Invalid applied date format');
      }
    } else if (status === 'Applied') {
      appliedDate = new Date();
    }

    let deadline = null;
    if (rawDeadline) {
      deadline = new Date(rawDeadline);
      if (isNaN(deadline.getTime())) {
        return sendResponse(res, 400, false, 'Invalid deadline date format');
      }
    } else if (scholarship.deadline) {
      deadline = scholarship.deadline;
    }

    const application = await Application.create({
      studentId: req.user._id,
      scholarshipId: rawScholarshipId,
      status,
      notes,
      appliedDate,
      deadline
    });

    await application.populate('scholarshipId');

    return sendResponse(res, 201, true, 'Application saved to tracker successfully', application);
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(
        res,
        400,
        false,
        'Scholarship is already being tracked in your application tracker'
      );
    }
    next(error);
  }
};

// @desc    Get all tracked applications for authenticated student
// @route   GET /api/applications
// @access  Private (Student)
const getApplications = async (req, res, next) => {
  try {
    const { status, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    const query = { studentId: req.user._id };

    if (status && status !== 'All') {
      const normalized = normalizeStatus(status);
      if (normalized) {
        query.status = normalized;
      }
    }

    const sort = {};
    if (sortBy === 'deadline') {
      sort.deadline = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'appliedDate' || sortBy === 'applicationDate') {
      sort.appliedDate = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.updatedAt = sortOrder === 'asc' ? 1 : -1;
    }

    const applications = await Application.find(query)
      .populate('scholarshipId')
      .sort(sort);

    return sendResponse(res, 200, true, 'Applications retrieved successfully', applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get status count statistics for student dashboard
// @route   GET /api/applications/stats
// @access  Private (Student)
const getApplicationStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const applications = await Application.find({ studentId });

    const stats = {
      total: applications.length,
      saved: 0,
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0
    };

    applications.forEach((app) => {
      if (app.status === 'Saved') stats.saved++;
      else if (app.status === 'Applied') stats.applied++;
      else if (app.status === 'Under Review') stats.underReview++;
      else if (app.status === 'Shortlisted') stats.shortlisted++;
      else if (app.status === 'Approved') stats.approved++;
      else if (app.status === 'Rejected') stats.rejected++;
      else if (app.status === 'Withdrawn') stats.withdrawn++;
    });

    return sendResponse(res, 200, true, 'Application statistics retrieved', stats);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application belonging to authenticated user
// @route   GET /api/applications/:id
// @access  Private (Student)
const getApplicationById = async (req, res, next) => {
  try {
    const appId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    // Security check: Ensure application belongs strictly to req.user._id
    const application = await Application.findOne({
      _id: appId,
      studentId: req.user._id
    }).populate('scholarshipId');

    if (!application) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    return sendResponse(res, 200, true, 'Application details retrieved', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Update single application belonging to authenticated user
// @route   PATCH /api/applications/:id
// @route   PUT /api/applications/:id
// @access  Private (Student)
const updateApplication = async (req, res, next) => {
  try {
    const appId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    // Security check: Ensure application belongs strictly to req.user._id
    const application = await Application.findOne({
      _id: appId,
      studentId: req.user._id
    });

    if (!application) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    const previousStatus = application.status;

    // Field Allowlist Security Check: Allow ONLY status, notes, appliedDate, applicationDate, deadline
    const { status, notes, appliedDate, applicationDate, deadline } = req.body;

    if (status !== undefined) {
      const normalized = normalizeStatus(status);
      if (!normalized) {
        return sendResponse(
          res,
          400,
          false,
          'Invalid status. Must be one of: Saved, Applied, Under Review, Shortlisted, Approved, Rejected, Withdrawn'
        );
      }
      application.status = normalized;
    }

    if (notes !== undefined) {
      const cleanNotes = String(notes).trim();
      if (cleanNotes.length > 1000) {
        return sendResponse(res, 400, false, 'Notes cannot exceed 1000 characters');
      }
      application.notes = cleanNotes;
    }

    const rawAppDate = appliedDate !== undefined ? appliedDate : applicationDate;
    if (rawAppDate !== undefined) {
      if (rawAppDate === null || rawAppDate === '') {
        application.appliedDate = null;
      } else {
        const parsedDate = new Date(rawAppDate);
        if (isNaN(parsedDate.getTime())) {
          return sendResponse(res, 400, false, 'Invalid application date format');
        }
        application.appliedDate = parsedDate;
      }
    }

    if (deadline !== undefined) {
      if (deadline === null || deadline === '') {
        application.deadline = null;
      } else {
        const parsedDeadline = new Date(deadline);
        if (isNaN(parsedDeadline.getTime())) {
          return sendResponse(res, 400, false, 'Invalid deadline date format');
        }
        application.deadline = parsedDeadline;
      }
    }

    await application.save();
    await application.populate('scholarshipId');

    // Trigger status change notification if status actually changed
    if (previousStatus !== application.status) {
      const schTitle = application.scholarshipId?.title || 'Scholarship';
      await createStatusNotification({
        studentId: req.user._id,
        scholarshipTitle: schTitle,
        previousStatus,
        newStatus: application.status,
        applicationId: application._id
      });
    }

    return sendResponse(res, 200, true, 'Application updated successfully', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single application tracker entry belonging to authenticated user
// @route   DELETE /api/applications/:id
// @access  Private (Student)
const deleteApplication = async (req, res, next) => {
  try {
    const appId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    // Security check: Ensure application belongs strictly to req.user._id
    const application = await Application.findOne({
      _id: appId,
      studentId: req.user._id
    });

    if (!application) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    await application.deleteOne();
    return sendResponse(res, 200, true, 'Application removed from tracker successfully');
  } catch (error) {
    next(error);
  }
};

// --- LEGACY BACKWARD COMPATIBILITY ENDPOINTS ---

const toggleSaveScholarship = async (req, res, next) => {
  try {
    const scholarshipId = req.params.scholarshipId;
    const studentId = req.user._id;

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    const existingSave = await SavedScholarship.findOne({ studentId, scholarshipId });

    if (existingSave) {
      await existingSave.deleteOne();
      return sendResponse(res, 200, true, 'Scholarship removed from saved list', { isSaved: false });
    } else {
      await SavedScholarship.create({ studentId, scholarshipId });
      return sendResponse(res, 201, true, 'Scholarship saved successfully', { isSaved: true });
    }
  } catch (error) {
    next(error);
  }
};

const getSavedScholarships = async (req, res, next) => {
  try {
    const saved = await SavedScholarship.find({ studentId: req.user._id }).populate('scholarshipId');
    const scholarships = saved
      .filter((s) => s.scholarshipId !== null)
      .map((s) => ({
        savedAt: s.savedAt,
        scholarship: s.scholarshipId
      }));

    return sendResponse(res, 200, true, 'Saved scholarships retrieved', scholarships);
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { scholarshipId, status, notes, appliedDate, remindersSet } = body;

    if (!scholarshipId || !status) {
      return sendResponse(res, 400, false, 'Scholarship ID and status are required');
    }

    const normalized = normalizeStatus(status);
    if (!normalized) {
      return sendResponse(res, 400, false, 'Invalid status format');
    }

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return sendResponse(res, 404, false, 'Scholarship not found');
    }

    let application = await Application.findOne({ studentId: req.user._id, scholarshipId });
    const previousStatus = application ? application.status : null;

    if (application) {
      application.status = normalized;
      if (notes !== undefined) application.notes = notes;
      if (appliedDate !== undefined) application.appliedDate = appliedDate;
      if (remindersSet !== undefined) application.remindersSet = remindersSet;
      await application.save();
    } else {
      application = await Application.create({
        studentId: req.user._id,
        scholarshipId,
        status: normalized,
        notes: notes || '',
        appliedDate: appliedDate || (normalized === 'Applied' ? new Date() : null),
        deadline: scholarship.deadline || null,
        remindersSet: remindersSet || false
      });
    }

    await application.populate('scholarshipId');

    if (previousStatus !== application.status) {
      await createStatusNotification({
        studentId: req.user._id,
        scholarshipTitle: scholarship.title,
        previousStatus: previousStatus || 'Saved',
        newStatus: application.status,
        applicationId: application._id
      });
    }

    return sendResponse(res, 200, true, `Application status updated to ${normalized}`, application);
  } catch (error) {
    next(error);
  }
};

const getTrackedApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('scholarshipId')
      .sort({ updatedAt: -1 });

    return sendResponse(res, 200, true, 'Tracked applications retrieved', applications);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationStats,
  getApplicationById,
  updateApplication,
  deleteApplication,
  toggleSaveScholarship,
  getSavedScholarships,
  updateApplicationStatus,
  getTrackedApplications
};
