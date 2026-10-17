const express = require('express');
const router = express.Router();
const {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  toggleScholarshipStatus,
  naturalLanguageSearch
} = require('../controllers/scholarshipController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { aiSearchLimiter } = require('../middleware/rateLimiterMiddleware');

// Public routes
router.get('/', getScholarships);

// Natural Language AI Search endpoint (STEP 8 requirement)
router.post('/natural-search', protect, aiSearchLimiter, naturalLanguageSearch);

router.get('/:id', getScholarshipById);

// Admin protected routes
router.post('/', protect, adminOnly, createScholarship);
router.put('/:id', protect, adminOnly, updateScholarship);
router.delete('/:id', protect, adminOnly, deleteScholarship);
router.patch('/:id/toggle', protect, adminOnly, toggleScholarshipStatus);

module.exports = router;
