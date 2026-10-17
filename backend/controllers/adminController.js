const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const { sendResponse } = require('../utils/responseHandler');
const { logAdminAction } = require('../services/auditLogService');
const { isValidEmailAddress } = require('../validators/authValidator');

// @desc    Get dashboard metrics & summary statistics (Admin)
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalScholarships = await Scholarship.countDocuments({});
    const activeScholarships = await Scholarship.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments({});

    // Upcoming Deadlines (within next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDeadlines = await Scholarship.find({
      isActive: true,
      deadline: { $gte: new Date(), $lte: thirtyDaysFromNow }
    })
      .select('title provider deadline amountText')
      .sort({ deadline: 1 })
      .limit(5);

    // Application Status Counts
    const statusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formattedStatus = {};
    ['Saved', 'Planning to Apply', 'Applied', 'Under Review', 'Approved', 'Rejected'].forEach((st) => {
      formattedStatus[st] = 0;
    });
    statusCounts.forEach((item) => {
      formattedStatus[item._id] = item.count;
    });

    return sendResponse(res, 200, true, 'Admin metrics fetched successfully', {
      totalStudents,
      totalScholarships,
      activeScholarships,
      totalApplications,
      upcomingDeadlines,
      statusCounts: formattedStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of registered students (Admin)
// @route   GET /api/admin/students
// @access  Private (Admin)
const getAllStudents = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = { role: 'student' };
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.course': { $regex: search, $options: 'i' } },
        { 'profile.stateOfDomicile': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendResponse(res, 200, true, 'Students list fetched', {
      students,
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

// @desc    Create a new admin account (Authorized Admin Only)
// @route   POST /api/admin/create-admin
// @access  Private (Admin)
const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (!name || name.trim() === '') {
      return sendResponse(res, 400, false, 'Admin name is required.');
    }

    if (!normalizedEmail || !isValidEmailAddress(normalizedEmail)) {
      return sendResponse(res, 400, false, 'Valid admin email address is required.');
    }

    // Check optional ADMIN_ALLOWED_EMAILS list
    if (process.env.ADMIN_ALLOWED_EMAILS) {
      const allowedList = process.env.ADMIN_ALLOWED_EMAILS.split(',').map((e) => e.toLowerCase().trim()).filter(Boolean);
      if (allowedList.length > 0 && !allowedList.includes(normalizedEmail)) {
        return sendResponse(res, 403, false, 'Email address is not present in ADMIN_ALLOWED_EMAILS allowlist.');
      }
    }

    // Admin Password Security Policy (Phase 6)
    if (!password || typeof password !== 'string' || password.length < 12) {
      return sendResponse(res, 400, false, 'Admin password must be at least 12 characters long.');
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      return sendResponse(
        res,
        400,
        false,
        'Admin password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendResponse(res, 400, false, 'User already exists with this email address.');
    }

    const newAdmin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      profile: {
        isProfileComplete: true
      }
    });

    await logAdminAction({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'ADMIN_CREATED_NEW_ADMIN',
      req,
      metadata: { newAdminId: newAdmin._id, newAdminEmail: newAdmin.email }
    });

    return sendResponse(res, 201, true, 'New Admin user created successfully', {
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      isEmailVerified: newAdmin.isEmailVerified
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle active / disabled status of a user (Admin)
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    if (req.user._id.toString() === targetUserId) {
      return sendResponse(res, 400, false, 'Self-deactivation is prohibited.');
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return sendResponse(res, 404, false, 'Target user account not found.');
    }

    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();

    await logAdminAction({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: targetUser.isActive ? 'USER_ACCOUNT_ACTIVATED' : 'USER_ACCOUNT_DISABLED',
      req,
      metadata: { targetUserId: targetUser._id, targetUserEmail: targetUser.email, role: targetUser.role }
    });

    return sendResponse(
      res,
      200,
      true,
      `User account status updated to ${targetUser.isActive ? 'Active' : 'Disabled'}`,
      {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs (Admin)
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const total = await AuditLog.countDocuments({});
    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return sendResponse(res, 200, true, 'Audit logs retrieved', {
      logs,
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

module.exports = {
  getAdminStats,
  getAllStudents,
  createAdminUser,
  toggleUserStatus,
  getAuditLogs
};
