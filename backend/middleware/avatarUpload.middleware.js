// avatarUpload.middleware.js
const multer = require('multer');
const path = require('path');

// Configure avatar file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function(req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

// File type filtering
const fileFilter = (req, file, cb) => {
  // Accepted image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type! Only JPG, JPEG, PNG and GIF images are allowed'), false);
  }
};

// Create upload middleware
const uploadAvatar = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // Limit to 5MB
  }
});

module.exports = uploadAvatar;