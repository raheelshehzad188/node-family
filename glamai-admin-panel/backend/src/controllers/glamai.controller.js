const glamaiService = require('../services/glamai/glamaiService');
const logger = require('../utils/logger');
const ApiLog = require('../models/ApiLog');

// Virtual Try-On
exports.virtualTryOn = async (req, res) => {
  try {
    const { userImageUrl, garmentImageUrl, maskType } = req.body;
    const userId = req.user.id;

    // Log API request
    const apiLog = await ApiLog.create({
      userId,
      endpoint: '/tryon',
      method: 'POST',
      requestData: req.body,
      ipAddress: req.ip
    });

    // Call GlamAI service
    const result = await glamaiService.virtualTryOn({
      userImageUrl,
      garmentImageUrl,
      maskType,
      userId
    });

    // Update API log with response
    apiLog.responseData = result;
    apiLog.statusCode = result.success ? 200 : 400;
    apiLog.responseTime = Date.now() - apiLog.createdAt;
    await apiLog.save();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Virtual try-on error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process virtual try-on'
    });
  }
};

// Image Beautification
exports.beautifyImage = async (req, res) => {
  try {
    const { imageUrl, beautificationLevel, features } = req.body;
    const userId = req.user.id;

    // Log API request
    const apiLog = await ApiLog.create({
      userId,
      endpoint: '/beautify',
      method: 'POST',
      requestData: req.body,
      ipAddress: req.ip
    });

    // Call GlamAI service
    const result = await glamaiService.beautifyImage({
      imageUrl,
      beautificationLevel,
      features,
      userId
    });

    // Update API log
    apiLog.responseData = result;
    apiLog.statusCode = result.success ? 200 : 400;
    apiLog.responseTime = Date.now() - apiLog.createdAt;
    await apiLog.save();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Beautify image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to beautify image'
    });
  }
};

// Apply Template
exports.applyTemplate = async (req, res) => {
  try {
    const { imageUrl, templateId, intensity } = req.body;
    const userId = req.user.id;

    // Log API request
    const apiLog = await ApiLog.create({
      userId,
      endpoint: '/template',
      method: 'POST',
      requestData: req.body,
      ipAddress: req.ip
    });

    // Call GlamAI service
    const result = await glamaiService.applyTemplate({
      imageUrl,
      templateId,
      intensity,
      userId
    });

    // Update API log
    apiLog.responseData = result;
    apiLog.statusCode = result.success ? 200 : 400;
    apiLog.responseTime = Date.now() - apiLog.createdAt;
    await apiLog.save();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Apply template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply template'
    });
  }
};

// Remove Background
exports.removeBackground = async (req, res) => {
  try {
    const { imageUrl, outputFormat } = req.body;
    const userId = req.user.id;

    // Log API request
    const apiLog = await ApiLog.create({
      userId,
      endpoint: '/background/remove',
      method: 'POST',
      requestData: req.body,
      ipAddress: req.ip
    });

    // Call GlamAI service
    const result = await glamaiService.removeBackground({
      imageUrl,
      outputFormat,
      userId
    });

    // Update API log
    apiLog.responseData = result;
    apiLog.statusCode = result.success ? 200 : 400;
    apiLog.responseTime = Date.now() - apiLog.createdAt;
    await apiLog.save();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Remove background error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove background'
    });
  }
};

// Style Transfer
exports.styleTransfer = async (req, res) => {
  try {
    const { contentImageUrl, styleImageUrl, strength } = req.body;
    const userId = req.user.id;

    // Log API request
    const apiLog = await ApiLog.create({
      userId,
      endpoint: '/style/transfer',
      method: 'POST',
      requestData: req.body,
      ipAddress: req.ip
    });

    // Call GlamAI service
    const result = await glamaiService.styleTransfer({
      contentImageUrl,
      styleImageUrl,
      strength,
      userId
    });

    // Update API log
    apiLog.responseData = result;
    apiLog.statusCode = result.success ? 200 : 400;
    apiLog.responseTime = Date.now() - apiLog.createdAt;
    await apiLog.save();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Style transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to transfer style'
    });
  }
};

// Batch Process
exports.batchProcess = async (req, res) => {
  try {
    const { operations } = req.body;
    const userId = req.user.id;

    // Log API request
    const apiLog = await ApiLog.create({
      userId,
      endpoint: '/batch',
      method: 'POST',
      requestData: req.body,
      ipAddress: req.ip
    });

    // Call GlamAI service
    const result = await glamaiService.batchProcess({
      operations,
      userId
    });

    // Update API log
    apiLog.responseData = result;
    apiLog.statusCode = result.success ? 200 : 400;
    apiLog.responseTime = Date.now() - apiLog.createdAt;
    await apiLog.save();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Batch process error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process batch operations'
    });
  }
};

// Get Processing Status
exports.getProcessingStatus = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await glamaiService.getStatus(requestId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Get status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get processing status'
    });
  }
};

// Get Batch Status
exports.getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;

    const result = await glamaiService.getBatchStatus(batchId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Get batch status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get batch status'
    });
  }
};

// Get Templates
exports.getTemplates = async (req, res) => {
  try {
    const { category, page, limit } = req.query;

    const result = await glamaiService.getTemplates({
      category,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
};

// Get API Quota
exports.getApiQuota = async (req, res) => {
  try {
    const result = await glamaiService.getApiQuota();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Get API quota error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get API quota'
    });
  }
};

// Validate API Key
exports.validateApiKey = async (req, res) => {
  try {
    const result = await glamaiService.validateApiKey();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Validate API key error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate API key'
    });
  }
};