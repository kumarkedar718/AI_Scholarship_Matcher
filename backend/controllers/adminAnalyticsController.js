const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const { sendResponse } = require('../utils/responseHandler');

/**
 * Helper to compute time-series application trends for N days
 */
const getTrendForDays = async (days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const trendAgg = await Application.aggregate([
    {
      $project: {
        effectiveDate: { $ifNull: ['$appliedDate', '$createdAt'] }
      }
    },
    {
      $match: {
        effectiveDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$effectiveDate' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const dateMap = {};
  trendAgg.forEach((item) => {
    dateMap[item._id] = item.count;
  });

  const timeSeries = [];
  const curr = new Date(startDate);
  const now = new Date();
  while (curr <= now) {
    const dateStr = curr.toISOString().split('T')[0];
    timeSeries.push({
      date: dateStr,
      count: dateMap[dateStr] || 0
    });
    curr.setDate(curr.getDate() + 1);
  }
  return timeSeries;
};

// @desc    Get complete master admin analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getFullAnalytics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      verifiedStudents,
      totalScholarships,
      activeScholarships,
      ongoingScholarships,
      totalApplications,
      statusAgg,
      popularScholarships,
      fixedDeadlineCount,
      ongoingDeadlineCount,
      closingWithin7Days,
      closingWithin30Days,
      genderAgg,
      categoryAgg,
      eduAgg,
      stateAgg,
      studentsWithProfiles,
      trend7Days,
      trend30Days,
      trend90Days
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isEmailVerified: true }),
      Scholarship.countDocuments({}),
      Scholarship.countDocuments({ isActive: true }),
      Scholarship.countDocuments({ isActive: true, deadline: null }),
      Application.countDocuments({}),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.aggregate([
        { $group: { _id: '$scholarshipId', applicationCount: { $sum: 1 } } },
        { $sort: { applicationCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'scholarships',
            localField: '_id',
            foreignField: '_id',
            as: 'scholarship'
          }
        },
        { $unwind: '$scholarship' },
        {
          $project: {
            _id: 0,
            scholarshipId: '$_id',
            title: '$scholarship.title',
            provider: '$scholarship.provider',
            categoryType: '$scholarship.categoryType',
            amountText: '$scholarship.amountText',
            officialUrl: '$scholarship.officialUrl',
            applicationCount: 1
          }
        }
      ]),
      Scholarship.countDocuments({ isActive: true, deadline: { $ne: null } }),
      Scholarship.countDocuments({ isActive: true, deadline: null }),
      Scholarship.countDocuments({
        isActive: true,
        deadline: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      }),
      Scholarship.countDocuments({
        isActive: true,
        deadline: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      }),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $ifNull: ['$profile.gender', ''] }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $ifNull: ['$profile.category', ''] }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $ifNull: ['$profile.educationLevel', ''] }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $ifNull: ['$profile.stateOfDomicile', ''] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      User.find({ role: 'student' }).select('profile.familyIncomeAnnual'),
      getTrendForDays(7),
      getTrendForDays(30),
      getTrendForDays(90)
    ]);

    const unverifiedStudents = totalStudents - verifiedStudents;

    const statusCounts = {
      Saved: 0,
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Approved: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    statusAgg.forEach((item) => {
      if (item._id && statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    const statusList = Object.keys(statusCounts).map((st) => ({
      status: st,
      count: statusCounts[st]
    }));

    const totalDecided = statusCounts.Approved + statusCounts.Rejected;
    const approvalRate = totalDecided > 0 ? Number(((statusCounts.Approved / totalDecided) * 100).toFixed(1)) : 0;

    const totalSubmitted =
      statusCounts.Applied +
      statusCounts['Under Review'] +
      statusCounts.Shortlisted +
      statusCounts.Approved +
      statusCounts.Rejected +
      statusCounts.Withdrawn;
    const applicationCompletionRate =
      totalApplications > 0 ? Number(((totalSubmitted / totalApplications) * 100).toFixed(1)) : 0;

    const avgApplicationsPerStudent = totalStudents > 0 ? Number((totalApplications / totalStudents).toFixed(2)) : 0;
    const avgApplicationsPerScholarship = totalScholarships > 0 ? Number((totalApplications / totalScholarships).toFixed(2)) : 0;

    // Process demographics
    const genderDistribution = genderAgg.map((item) => ({
      label: !item._id || item._id.trim() === '' ? 'Not Specified' : item._id,
      count: item.count
    }));

    const categoryDistribution = categoryAgg.map((item) => ({
      label: !item._id || item._id.trim() === '' ? 'Not Specified' : item._id,
      count: item.count
    }));

    const educationLevelDistribution = eduAgg.map((item) => ({
      label: !item._id || item._id.trim() === '' ? 'Not Specified' : item._id,
      count: item.count
    }));

    const stateDistribution = stateAgg.map((item) => ({
      label: !item._id || item._id.trim() === '' ? 'Not Specified' : item._id,
      count: item.count
    }));

    const incomeRanges = {
      '< 1.5 Lakhs': 0,
      '1.5L - 3 Lakhs': 0,
      '3L - 6 Lakhs': 0,
      '> 6 Lakhs': 0,
      'Not Specified': 0
    };

    studentsWithProfiles.forEach((u) => {
      const inc = u.profile ? u.profile.familyIncomeAnnual : null;
      if (inc === null || inc === undefined || inc === 0) {
        incomeRanges['Not Specified']++;
      } else if (inc <= 150000) {
        incomeRanges['< 1.5 Lakhs']++;
      } else if (inc <= 300000) {
        incomeRanges['1.5L - 3 Lakhs']++;
      } else if (inc <= 600000) {
        incomeRanges['3L - 6 Lakhs']++;
      } else {
        incomeRanges['> 6 Lakhs']++;
      }
    });

    const incomeDistribution = Object.keys(incomeRanges).map((label) => ({
      label,
      count: incomeRanges[label]
    }));

    return sendResponse(res, 200, true, 'Admin analytics fetched successfully', {
      overview: {
        totalStudents,
        verifiedStudents,
        unverifiedStudents,
        totalScholarships,
        activeScholarships,
        ongoingScholarships,
        totalApplications,
        savedApplications: statusCounts.Saved,
        appliedApplications: statusCounts.Applied,
        underReviewApplications: statusCounts['Under Review'],
        shortlistedApplications: statusCounts.Shortlisted,
        approvedApplications: statusCounts.Approved,
        rejectedApplications: statusCounts.Rejected,
        withdrawnApplications: statusCounts.Withdrawn,
        approvalRate,
        applicationCompletionRate,
        avgApplicationsPerStudent,
        avgApplicationsPerScholarship
      },
      applications: {
        statusDistribution: statusList,
        statusCounts,
        trends: {
          days7: trend7Days,
          days30: trend30Days,
          days90: trend90Days
        }
      },
      scholarships: {
        popularScholarships,
        deadlineOverview: {
          totalActive: activeScholarships,
          fixedDeadline: fixedDeadlineCount,
          ongoing: ongoingDeadlineCount,
          closingWithin7Days,
          closingWithin30Days
        }
      },
      students: {
        genderDistribution,
        categoryDistribution,
        educationLevelDistribution,
        stateDistribution,
        incomeDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Overview Analytics Sub-endpoint
// @route   GET /api/admin/analytics/overview
// @access  Private (Admin)
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      verifiedStudents,
      totalScholarships,
      activeScholarships,
      ongoingScholarships,
      totalApplications,
      statusAgg
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isEmailVerified: true }),
      Scholarship.countDocuments({}),
      Scholarship.countDocuments({ isActive: true }),
      Scholarship.countDocuments({ isActive: true, deadline: null }),
      Application.countDocuments({}),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    const unverifiedStudents = totalStudents - verifiedStudents;

    const statusCounts = {
      Saved: 0,
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Approved: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    statusAgg.forEach((item) => {
      if (item._id && statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    const totalDecided = statusCounts.Approved + statusCounts.Rejected;
    const approvalRate = totalDecided > 0 ? Number(((statusCounts.Approved / totalDecided) * 100).toFixed(1)) : 0;

    const totalSubmitted =
      statusCounts.Applied +
      statusCounts['Under Review'] +
      statusCounts.Shortlisted +
      statusCounts.Approved +
      statusCounts.Rejected +
      statusCounts.Withdrawn;
    const applicationCompletionRate =
      totalApplications > 0 ? Number(((totalSubmitted / totalApplications) * 100).toFixed(1)) : 0;

    const avgApplicationsPerStudent = totalStudents > 0 ? Number((totalApplications / totalStudents).toFixed(2)) : 0;
    const avgApplicationsPerScholarship = totalScholarships > 0 ? Number((totalApplications / totalScholarships).toFixed(2)) : 0;

    return sendResponse(res, 200, true, 'Overview analytics fetched successfully', {
      totalStudents,
      verifiedStudents,
      unverifiedStudents,
      totalScholarships,
      activeScholarships,
      ongoingScholarships,
      totalApplications,
      savedApplications: statusCounts.Saved,
      appliedApplications: statusCounts.Applied,
      underReviewApplications: statusCounts['Under Review'],
      shortlistedApplications: statusCounts.Shortlisted,
      approvedApplications: statusCounts.Approved,
      rejectedApplications: statusCounts.Rejected,
      withdrawnApplications: statusCounts.Withdrawn,
      approvalRate,
      applicationCompletionRate,
      avgApplicationsPerStudent,
      avgApplicationsPerScholarship
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Application Analytics Sub-endpoint
// @route   GET /api/admin/analytics/applications
// @access  Private (Admin)
const getApplicationAnalytics = async (req, res, next) => {
  try {
    const [statusAgg, trend7Days, trend30Days, trend90Days] = await Promise.all([
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      getTrendForDays(7),
      getTrendForDays(30),
      getTrendForDays(90)
    ]);

    const statusCounts = {
      Saved: 0,
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Approved: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    statusAgg.forEach((item) => {
      if (item._id && statusCounts.hasOwnProperty(item._id)) {
        statusCounts[item._id] = item.count;
      }
    });

    const statusDistribution = Object.keys(statusCounts).map((st) => ({
      status: st,
      count: statusCounts[st]
    }));

    return sendResponse(res, 200, true, 'Application analytics fetched successfully', {
      statusDistribution,
      statusCounts,
      trends: {
        days7: trend7Days,
        days30: trend30Days,
        days90: trend90Days
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Scholarship Analytics Sub-endpoint
// @route   GET /api/admin/analytics/scholarships
// @access  Private (Admin)
const getScholarshipAnalytics = async (req, res, next) => {
  try {
    const [
      popularScholarships,
      totalActive,
      fixedDeadline,
      ongoing,
      closingWithin7Days,
      closingWithin30Days
    ] = await Promise.all([
      Application.aggregate([
        { $group: { _id: '$scholarshipId', applicationCount: { $sum: 1 } } },
        { $sort: { applicationCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'scholarships',
            localField: '_id',
            foreignField: '_id',
            as: 'scholarship'
          }
        },
        { $unwind: '$scholarship' },
        {
          $project: {
            _id: 0,
            scholarshipId: '$_id',
            title: '$scholarship.title',
            provider: '$scholarship.provider',
            categoryType: '$scholarship.categoryType',
            amountText: '$scholarship.amountText',
            officialUrl: '$scholarship.officialUrl',
            applicationCount: 1
          }
        }
      ]),
      Scholarship.countDocuments({ isActive: true }),
      Scholarship.countDocuments({ isActive: true, deadline: { $ne: null } }),
      Scholarship.countDocuments({ isActive: true, deadline: null }),
      Scholarship.countDocuments({
        isActive: true,
        deadline: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      }),
      Scholarship.countDocuments({
        isActive: true,
        deadline: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    return sendResponse(res, 200, true, 'Scholarship analytics fetched successfully', {
      popularScholarships,
      deadlineOverview: {
        totalActive,
        fixedDeadline,
        ongoing,
        closingWithin7Days,
        closingWithin30Days
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student Analytics Sub-endpoint
// @route   GET /api/admin/analytics/students
// @access  Private (Admin)
const getStudentAnalytics = async (req, res, next) => {
  try {
    const [genderAgg, categoryAgg, eduAgg, stateAgg, studentsWithProfiles] = await Promise.all([
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $ifNull: ['$profile.gender', ''] }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $ifNull: ['$profile.category', ''] }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $ifNull: ['$profile.educationLevel', ''] }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { $ifNull: ['$profile.stateOfDomicile', ''] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      User.find({ role: 'student' }).select('profile.familyIncomeAnnual')
    ]);

    const genderDistribution = genderAgg.map((item) => ({
      label: !item._id || item._id.trim() === '' ? 'Not Specified' : item._id,
      count: item.count
    }));

    const categoryDistribution = categoryAgg.map((item) => ({
      label: !item._id || item._id.trim() === '' ? 'Not Specified' : item._id,
      count: item.count
    }));

    const educationLevelDistribution = eduAgg.map((item) => ({
      label: !item._id || item._id.trim() === '' ? 'Not Specified' : item._id,
      count: item.count
    }));

    const stateDistribution = stateAgg.map((item) => ({
      label: !item._id || item._id.trim() === '' ? 'Not Specified' : item._id,
      count: item.count
    }));

    const incomeRanges = {
      '< 1.5 Lakhs': 0,
      '1.5L - 3 Lakhs': 0,
      '3L - 6 Lakhs': 0,
      '> 6 Lakhs': 0,
      'Not Specified': 0
    };

    studentsWithProfiles.forEach((u) => {
      const inc = u.profile ? u.profile.familyIncomeAnnual : null;
      if (inc === null || inc === undefined || inc === 0) {
        incomeRanges['Not Specified']++;
      } else if (inc <= 150000) {
        incomeRanges['< 1.5 Lakhs']++;
      } else if (inc <= 300000) {
        incomeRanges['1.5L - 3 Lakhs']++;
      } else if (inc <= 600000) {
        incomeRanges['3L - 6 Lakhs']++;
      } else {
        incomeRanges['> 6 Lakhs']++;
      }
    });

    const incomeDistribution = Object.keys(incomeRanges).map((label) => ({
      label,
      count: incomeRanges[label]
    }));

    return sendResponse(res, 200, true, 'Student analytics fetched successfully', {
      genderDistribution,
      categoryDistribution,
      educationLevelDistribution,
      stateDistribution,
      incomeDistribution
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFullAnalytics,
  getOverviewAnalytics,
  getApplicationAnalytics,
  getScholarshipAnalytics,
  getStudentAnalytics
};
