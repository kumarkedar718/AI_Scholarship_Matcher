const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists securely (not publicly served)
const uploadDir = path.join(__dirname, '../uploads/income-certificates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.pdf', '.jpg', '.jpeg', '.png'].includes(ext) ? ext : '.bin';
    const userId = req.user ? req.user._id.toString() : 'guest';
    const uniqueName = `income-cert-${userId}-${Date.now()}${safeExt}`;
    cb(null, uniqueName);
  }
});

// File Filter for Security (MIME type + File Extension)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/pjpeg'
  ];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.'), false);
  }
};

const uploadIncomeCert = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter
}).single('incomeCertificate');

module.exports = {
  uploadIncomeCert,
  uploadDir
};
