const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, checkPermission } = require('../middleware/auth');
const glamaiController = require('../controllers/glamai.controller');

// All routes require authentication and API access permission
router.use(protect);
router.use(checkPermission('api_access'));

// Validation rules
const tryOnValidation = [
  body('userImageUrl').isURL().withMessage('Valid user image URL is required'),
  body('garmentImageUrl').isURL().withMessage('Valid garment image URL is required'),
  body('maskType').optional().isIn(['overall', 'upper', 'lower']).withMessage('Invalid mask type')
];

const beautifyValidation = [
  body('imageUrl').isURL().withMessage('Valid image URL is required'),
  body('beautificationLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid beautification level'),
  body('features').optional().isArray().withMessage('Features must be an array')
];

const templateValidation = [
  body('imageUrl').isURL().withMessage('Valid image URL is required'),
  body('templateId').notEmpty().withMessage('Template ID is required'),
  body('intensity').optional().isFloat({ min: 0, max: 1 }).withMessage('Intensity must be between 0 and 1')
];

const backgroundRemovalValidation = [
  body('imageUrl').isURL().withMessage('Valid image URL is required'),
  body('outputFormat').optional().isIn(['png', 'jpg', 'webp']).withMessage('Invalid output format')
];

const styleTransferValidation = [
  body('contentImageUrl').isURL().withMessage('Valid content image URL is required'),
  body('styleImageUrl').isURL().withMessage('Valid style image URL is required'),
  body('strength').optional().isFloat({ min: 0, max: 1 }).withMessage('Strength must be between 0 and 1')
];

const batchValidation = [
  body('operations').isArray({ min: 1, max: 50 }).withMessage('Operations must be an array with 1-50 items'),
  body('operations.*.type').isIn(['tryon', 'beautify', 'template', 'background', 'style']).withMessage('Invalid operation type'),
  body('operations.*.params').isObject().withMessage('Operation params must be an object')
];

// Routes
router.post('/tryon', validate(tryOnValidation), glamaiController.virtualTryOn);
router.post('/beautify', validate(beautifyValidation), glamaiController.beautifyImage);
router.post('/template', validate(templateValidation), glamaiController.applyTemplate);
router.post('/background/remove', validate(backgroundRemovalValidation), glamaiController.removeBackground);
router.post('/style/transfer', validate(styleTransferValidation), glamaiController.styleTransfer);
router.post('/batch', validate(batchValidation), glamaiController.batchProcess);

// Status and information routes
router.get('/status/:requestId', glamaiController.getProcessingStatus);
router.get('/batch/:batchId', glamaiController.getBatchStatus);
router.get('/templates', glamaiController.getTemplates);
router.get('/quota', glamaiController.getApiQuota);
router.get('/validate', glamaiController.validateApiKey);

module.exports = router;