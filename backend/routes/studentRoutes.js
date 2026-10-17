const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  updateStudentProfile,
  uploadIncomeCertificate,
  getIncomeCertificate,
  streamIncomeCertificate,
  deleteIncomeCertificate
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getStudentProfile);
router.put('/profile', protect, updateStudentProfile);

// Income Certificate Endpoints
router.post('/income-certificate', protect, uploadIncomeCertificate);
router.post('/profile/income-certificate', protect, uploadIncomeCertificate);

router.get('/income-certificate', protect, getIncomeCertificate);
router.get('/profile/income-certificate', protect, getIncomeCertificate);

router.get('/income-certificate/file', protect, streamIncomeCertificate);
router.get('/profile/income-certificate/file', protect, streamIncomeCertificate);

router.delete('/income-certificate', protect, deleteIncomeCertificate);
router.delete('/profile/income-certificate', protect, deleteIncomeCertificate);

module.exports = router;
