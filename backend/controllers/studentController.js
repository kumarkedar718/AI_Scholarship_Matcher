const User = require('../models/User');
const Document = require('../models/Document');
const { sendResponse } = require('../utils/responseHandler');
const { uploadIncomeCert, uploadDir } = require('../middleware/uploadMiddleware');
const fs = require('fs');
const path = require('path');

// Helper to calculate profile completion percentage based on required fields
const calculateProfileCompletion = (user, profile) => {
  const fields = [
    Boolean(user.name),
    Boolean(user.email),
    Boolean(profile.phone && profile.phone.trim()),
    Boolean(profile.educationLevel && profile.educationLevel.trim()),
    Boolean(profile.course && profile.course.trim()),
    Boolean(profile.branch && profile.branch.trim()),
    Number(profile.currentYear) > 0,
    Number(profile.currentSemester) > 0,
    Number(profile.cgpaOrPercentage) > 0,
    profile.familyIncomeAnnual !== undefined && profile.familyIncomeAnnual !== null && Number(profile.familyIncomeAnnual) >= 0,
    Boolean(profile.stateOfDomicile && profile.stateOfDomicile.trim()),
    Boolean(profile.category && profile.category.trim()),
    Boolean(profile.gender && profile.gender.trim())
  ];

  const completedCount = fields.filter(Boolean).length;
  return Math.round((completedCount / fields.length) * 100);
};

// @desc    Get logged in student profile details
// @route   GET /api/student/profile
// @access  Private (Student)
const getStudentProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendResponse(res, 404, false, 'User profile not found');
    }

    const completionPercentage = calculateProfileCompletion(user, user.profile);

    return sendResponse(res, 200, true, 'Student profile retrieved', {
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      completionPercentage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile details
// @route   PUT /api/student/profile
// @access  Private (Student)
const updateStudentProfile = async (req, res, next) => {
  try {
    // Identity is derived strictly from authenticated JWT token
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendResponse(res, 404, false, 'User profile not found');
    }

    const {
      name,
      phone,
      educationLevel,
      course,
      branch,
      currentYear,
      currentSemester,
      cgpaOrPercentage,
      maxCgpaOrScale,
      familyIncomeAnnual,
      stateOfDomicile,
      category,
      gender,
      isDisability,
      disabilityPercentage,
      isSingleGirlChild
    } = req.body;

    // Validation 1: CGPA / Marks
    if (cgpaOrPercentage !== undefined && cgpaOrPercentage !== null && cgpaOrPercentage !== '') {
      const cgpa = Number(cgpaOrPercentage);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 100) {
        return sendResponse(res, 400, false, 'Invalid CGPA or Percentage marks. Must be a numeric value between 0 and 100.');
      }
    }

    // Validation 2: Family Annual Income
    if (familyIncomeAnnual !== undefined && familyIncomeAnnual !== null && familyIncomeAnnual !== '') {
      const income = Number(familyIncomeAnnual);
      if (isNaN(income) || income < 0) {
        return sendResponse(res, 400, false, 'Invalid Family Annual Income. Must be a non-negative numeric value.');
      }
    }

    // Validation 3: Education Level Enum
    const validEduLevels = ['Undergraduate', 'Postgraduate', 'Diploma', 'PhD', 'School', ''];
    if (educationLevel !== undefined && !validEduLevels.includes(educationLevel)) {
      return sendResponse(res, 400, false, `Invalid Education Level. Must be one of: ${validEduLevels.filter(Boolean).join(', ')}`);
    }

    // Validation 4: Social Category Enum
    const validCategories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', ''];
    if (category !== undefined && !validCategories.includes(category)) {
      return sendResponse(res, 400, false, `Invalid Social Category. Must be one of: ${validCategories.filter(Boolean).join(', ')}`);
    }

    // Validation 5: Gender Enum
    const validGenders = ['Male', 'Female', 'Other', 'Any', ''];
    if (gender !== undefined && !validGenders.includes(gender)) {
      return sendResponse(res, 400, false, `Invalid Gender. Must be one of: ${validGenders.filter(Boolean).join(', ')}`);
    }

    // Update User Name if provided
    if (name && name.trim() !== '') {
      user.name = name.trim();
    }

    const existingProfile = user.profile && typeof user.profile.toObject === 'function' 
      ? user.profile.toObject() 
      : (user.profile || {});

    // Update Profile fields cleanly
    user.profile = {
      ...existingProfile,
      phone: phone !== undefined ? String(phone).trim() : existingProfile.phone || '',
      educationLevel: educationLevel !== undefined ? educationLevel : existingProfile.educationLevel || '',
      course: course !== undefined ? String(course).trim() : existingProfile.course || '',
      branch: branch !== undefined ? String(branch).trim() : existingProfile.branch || '',
      currentYear: currentYear !== undefined ? Number(currentYear) : existingProfile.currentYear || 1,
      currentSemester: currentSemester !== undefined ? Number(currentSemester) : existingProfile.currentSemester || 1,
      cgpaOrPercentage: cgpaOrPercentage !== undefined && cgpaOrPercentage !== '' ? Number(cgpaOrPercentage) : existingProfile.cgpaOrPercentage || 0,
      maxCgpaOrScale: maxCgpaOrScale !== undefined && maxCgpaOrScale !== '' ? Number(maxCgpaOrScale) : existingProfile.maxCgpaOrScale || 10,
      familyIncomeAnnual: familyIncomeAnnual !== undefined && familyIncomeAnnual !== '' ? Number(familyIncomeAnnual) : existingProfile.familyIncomeAnnual || 0,
      stateOfDomicile: stateOfDomicile !== undefined ? String(stateOfDomicile).trim() : existingProfile.stateOfDomicile || '',
      category: category !== undefined ? category : existingProfile.category || '',
      gender: gender !== undefined ? gender : existingProfile.gender || '',
      isDisability: isDisability !== undefined ? Boolean(isDisability) : existingProfile.isDisability || false,
      disabilityPercentage: disabilityPercentage !== undefined && disabilityPercentage !== '' ? Number(disabilityPercentage) : existingProfile.disabilityPercentage || 0,
      isSingleGirlChild: isSingleGirlChild !== undefined ? Boolean(isSingleGirlChild) : existingProfile.isSingleGirlChild || false
    };

    // Calculate updated completion percentage
    const completionPercentage = calculateProfileCompletion(user, user.profile);
    user.profile.isProfileComplete = completionPercentage >= 80;

    const updatedUser = await user.save();

    return sendResponse(res, 200, true, 'Student profile updated successfully', {
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile,
        completionPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Parent/Guardian Income Certificate
// @route   POST /api/student/income-certificate
// @access  Private (Student)
const uploadIncomeCertificate = (req, res, next) => {
  uploadIncomeCert(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendResponse(res, 400, false, 'File size exceeds maximum limit of 5 MB.');
      }
      return sendResponse(res, 400, false, err.message || 'File upload error.');
    }

    if (!req.file) {
      return sendResponse(res, 400, false, 'No document file provided for upload.');
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return sendResponse(res, 404, false, 'Student profile not found');
      }

      // If existing file is present, remove old file from disk
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        const oldFiles = files.filter(f => f.startsWith(`income-cert-${user._id.toString()}-`) && f !== req.file.filename);
        for (const file of oldFiles) {
          try {
            fs.unlinkSync(path.join(uploadDir, file));
          } catch (e) {}
        }
      }

      const relativeFileUrl = `/api/student/income-certificate/file`;

      const certData = {
        url: relativeFileUrl,
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      };

      if (!user.profile) user.profile = {};
      user.profile.parentIncomeCertificate = certData;
      await user.save();

      // Sync with Document collection
      await Document.findOneAndUpdate(
        { studentId: user._id, documentName: 'Parent/Guardian Income Certificate' },
        {
          studentId: user._id,
          documentName: 'Parent/Guardian Income Certificate',
          fileUrl: relativeFileUrl,
          isVerifiedByUser: true,
          uploadedAt: certData.uploadedAt
        },
        { upsert: true, new: true }
      );

      return sendResponse(res, 200, true, 'Parent/Guardian Income Certificate uploaded successfully', {
        parentIncomeCertificate: certData
      });
    } catch (error) {
      next(error);
    }
  });
};

// @desc    Get Income Certificate Status / Details
// @route   GET /api/student/income-certificate
// @access  Private (Student)
const getIncomeCertificate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendResponse(res, 404, false, 'Student profile not found');
    }

    const cert = user.profile ? user.profile.parentIncomeCertificate : null;
    const uploaded = Boolean(cert && cert.url);

    return sendResponse(res, 200, true, 'Income certificate details retrieved', {
      uploaded,
      parentIncomeCertificate: cert || null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream / View / Download Income Certificate File
// @route   GET /api/student/income-certificate/file (or with ?studentId=... for admin)
// @access  Private (Student owner or Admin)
const streamIncomeCertificate = async (req, res, next) => {
  try {
    let targetUserId = req.user._id;
    if (req.query.studentId && req.user.role === 'admin') {
      targetUserId = req.query.studentId;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return sendResponse(res, 404, false, 'Student profile not found');
    }

    const cert = targetUser.profile ? targetUser.profile.parentIncomeCertificate : null;
    if (!cert || !cert.url) {
      return sendResponse(res, 404, false, 'No income certificate found for this student');
    }

    if (!fs.existsSync(uploadDir)) {
      return sendResponse(res, 404, false, 'Document directory not found');
    }

    let targetFileName = cert.filename;
    if (!targetFileName) {
      const files = fs.readdirSync(uploadDir);
      targetFileName = files.find(f => f.startsWith(`income-cert-${targetUser._id.toString()}-`));
    }

    if (!targetFileName) {
      return sendResponse(res, 404, false, 'Document file not found on server storage');
    }

    const filePath = path.join(uploadDir, targetFileName);
    if (!filePath.startsWith(uploadDir)) {
      return sendResponse(res, 403, false, 'Invalid file path request');
    }

    if (!fs.existsSync(filePath)) {
      return sendResponse(res, 404, false, 'Document file not found on disk');
    }

    res.setHeader('Content-Type', cert.mimeType || 'application/octet-stream');
    const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename="${cert.originalName || 'Income_Certificate'}"`);
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Income Certificate
// @route   DELETE /api/student/income-certificate
// @access  Private (Student)
const deleteIncomeCertificate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendResponse(res, 404, false, 'Student profile not found');
    }

    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      const userFiles = files.filter(f => f.startsWith(`income-cert-${user._id.toString()}-`));
      for (const file of userFiles) {
        try {
          fs.unlinkSync(path.join(uploadDir, file));
        } catch (e) {}
      }
    }

    if (user.profile) {
      user.profile.parentIncomeCertificate = {
        url: '',
        originalName: '',
        mimeType: '',
        size: 0,
        uploadedAt: null
      };
    }
    await user.save();

    await Document.deleteOne({ studentId: user._id, documentName: 'Parent/Guardian Income Certificate' });

    return sendResponse(res, 200, true, 'Income certificate deleted successfully', {
      uploaded: false,
      parentIncomeCertificate: user.profile.parentIncomeCertificate
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  uploadIncomeCertificate,
  getIncomeCertificate,
  streamIncomeCertificate,
  deleteIncomeCertificate
};

