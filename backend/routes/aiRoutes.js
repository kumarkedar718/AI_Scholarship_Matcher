const express = require('express');
const router = express.Router();
const {
  getAIRecommendations,
  naturalLanguageSearch,
  explainScholarshipMatch,
  summarizeScholarship
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { aiSearchLimiter } = require('../middleware/rateLimiterMiddleware');

router.get('/recommendations', protect, getAIRecommendations);
router.post('/natural-search', protect, aiSearchLimiter, naturalLanguageSearch);
router.get('/explain/:scholarshipId', protect, explainScholarshipMatch);
router.get('/summary/:scholarshipId', summarizeScholarship);

module.exports = router;
