const express = require('express');
const router = express.Router();
const {
  evaluateSingleScholarship,
  getEligibleScholarshipsForStudent
} = require('../controllers/eligibilityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/evaluate/:scholarshipId', protect, evaluateSingleScholarship);
router.get('/my-matches', protect, getEligibleScholarshipsForStudent);

module.exports = router;
