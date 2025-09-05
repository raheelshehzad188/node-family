const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { protect, checkPermission } = require('../middleware/auth');
const uploadController = require('../controllers/upload.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../uploads');
    
    if (file.fieldname === 'garment') {
      uploadPath = path.join(uploadPath, 'garments');
    } else if (file.fieldname === 'user') {
      uploadPath = path.join(uploadPath, 'users');
    } else {
      uploadPath = path.join(uploadPath, 'general');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// All routes require authentication
router.use(protect);
router.use(checkPermission('upload_media'));

// Upload single image
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Upload user photo
router.post('/user', upload.single('user'), uploadController.uploadUserPhoto);

// Upload garment image
router.post('/garment', upload.single('garment'), uploadController.uploadGarment);

// Upload multiple images
router.post('/batch', upload.array('images', 10), uploadController.uploadBatch);

// Delete uploaded file
router.delete('/:fileId', uploadController.deleteFile);

// Get user's uploaded files
router.get('/my-files', uploadController.getMyFiles);

module.exports = router;