const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllStudents,
  createAdminUser,
  toggleUserStatus,
  getAuditLogs
} = require('../controllers/adminController');
const {
  getFullAnalytics,
  getOverviewAnalytics,
  getApplicationAnalytics,
  getScholarshipAnalytics,
  getStudentAnalytics
} = require('../controllers/adminAnalyticsController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/students', protect, adminOnly, getAllStudents);
router.post('/create-admin', protect, adminOnly, createAdminUser);
router.patch('/users/:id/toggle-status', protect, adminOnly, toggleUserStatus);
router.get('/audit-logs', protect, adminOnly, getAuditLogs);

// Admin Analytics Endpoints
router.get('/analytics', protect, adminOnly, getFullAnalytics);
router.get('/analytics/overview', protect, adminOnly, getOverviewAnalytics);
router.get('/analytics/applications', protect, adminOnly, getApplicationAnalytics);
router.get('/analytics/scholarships', protect, adminOnly, getScholarshipAnalytics);
router.get('/analytics/students', protect, adminOnly, getStudentAnalytics);

module.exports = router;

