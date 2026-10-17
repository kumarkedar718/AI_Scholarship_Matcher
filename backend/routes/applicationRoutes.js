const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// Static / Named endpoints (must be defined BEFORE /:id parameterized routes)
router.get('/stats', protect, getApplicationStats);
router.get('/saved', protect, getSavedScholarships);
router.get('/tracker', protect, getTrackedApplications);
router.post('/save/:scholarshipId', protect, toggleSaveScholarship);
router.post('/track', protect, updateApplicationStatus);

// Collection endpoints
router.post('/', protect, createApplication);
router.get('/', protect, getApplications);

// Parameterized /:id endpoints (must be defined AFTER static paths)
router.get('/:id', protect, getApplicationById);
router.patch('/:id', protect, updateApplication);
router.put('/:id', protect, updateApplication);
router.delete('/:id', protect, deleteApplication);

module.exports = router;


