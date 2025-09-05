const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const analyticsController = require('../controllers/analytics.controller');

// All routes require authentication and view_analytics permission
router.use(protect);
router.use(checkPermission('view_analytics'));

// Dashboard stats
router.get('/dashboard', analyticsController.getDashboardStats);

// API usage statistics
router.get('/api-usage', analyticsController.getApiUsageStats);

// User analytics
router.get('/users', analyticsController.getUserAnalytics);

// Endpoint performance
router.get('/endpoints', analyticsController.getEndpointPerformance);

// Hourly/Daily/Monthly trends
router.get('/trends', analyticsController.getTrends);

// Error analytics
router.get('/errors', analyticsController.getErrorAnalytics);

// Export analytics data
router.get('/export', analyticsController.exportAnalytics);

module.exports = router;