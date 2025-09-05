const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const Upload = require('../models/Upload');

// Upload single image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Save upload record
    const upload = await Upload.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      type: 'general'
    });

    res.json({
      success: true,
      file: {
        id: upload._id,
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
};

// Upload user photo
exports.uploadUserPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/users/${req.file.filename}`;

    // Save upload record
    const upload = await Upload.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      type: 'user_photo'
    });

    res.json({
      success: true,
      file: {
        id: upload._id,
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('Upload user photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload user photo'
    });
  }
};

// Upload garment
exports.uploadGarment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/garments/${req.file.filename}`;

    // Save upload record
    const upload = await Upload.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      type: 'garment',
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {}
    });

    res.json({
      success: true,
      file: {
        id: upload._id,
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('Upload garment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload garment'
    });
  }
};

// Upload batch
exports.uploadBatch = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileUrl = `${baseUrl}/uploads/${file.filename}`;
      
      const upload = await Upload.create({
        userId: req.user.id,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        type: 'general'
      });

      uploadedFiles.push({
        id: upload._id,
        url: fileUrl,
        filename: file.filename,
        size: file.size
      });
    }

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    logger.error('Batch upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const upload = await Upload.findOne({
      _id: fileId,
      userId: req.user.id
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../uploads', upload.filename);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      logger.warn('Failed to delete physical file:', err);
    }

    // Delete database record
    await upload.remove();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
};

// Get user's files
exports.getMyFiles = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const query = { userId: req.user.id };
    if (type) {
      query.type = type;
    }

    const files = await Upload.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Upload.countDocuments(query);

    res.json({
      success: true,
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get files'
    });
  }
};