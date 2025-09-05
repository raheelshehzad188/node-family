const ApiLog = require('../models/ApiLog');
const User = require('../models/User');
const Upload = require('../models/Upload');
const logger = require('../utils/logger');
const { startOfDay, endOfDay, subDays, format } = require('date-fns');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const lastWeek = subDays(today, 7);
    const lastMonth = subDays(today, 30);

    // Get total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get API usage stats
    const todayApiCalls = await ApiLog.countDocuments({
      createdAt: { $gte: startOfDay(today), $lte: endOfDay(today) }
    });

    const yesterdayApiCalls = await ApiLog.countDocuments({
      createdAt: { $gte: startOfDay(yesterday), $lte: endOfDay(yesterday) }
    });

    const weekApiCalls = await ApiLog.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    const monthApiCalls = await ApiLog.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    // Get success/failure rates
    const successCalls = await ApiLog.countDocuments({
      createdAt: { $gte: lastMonth },
      statusCode: { $lt: 400 }
    });

    const successRate = monthApiCalls > 0 
      ? ((successCalls / monthApiCalls) * 100).toFixed(2)
      : 100;

    // Get average response time
    const avgResponseTime = await ApiLog.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      { 
        $group: { 
          _id: null, 
          avgTime: { $avg: '$responseTime' } 
        } 
      }
    ]);

    // Get storage stats
    const storageStats = await Upload.aggregate([
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    // Calculate percentage changes
    const apiCallChange = yesterdayApiCalls > 0
      ? ((todayApiCalls - yesterdayApiCalls) / yesterdayApiCalls * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        apiUsage: {
          today: todayApiCalls,
          yesterday: yesterdayApiCalls,
          week: weekApiCalls,
          month: monthApiCalls,
          change: apiCallChange,
          successRate: parseFloat(successRate),
          avgResponseTime: avgResponseTime[0]?.avgTime || 0
        },
        storage: {
          totalFiles: storageStats[0]?.totalFiles || 0,
          totalSize: storageStats[0]?.totalSize || 0
        }
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard statistics'
    });
  }
};

// Get API usage statistics
exports.getApiUsageStats = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'endpoint' } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    let groupField;
    switch (groupBy) {
      case 'user':
        groupField = '$userId';
        break;
      case 'method':
        groupField = '$method';
        break;
      case 'status':
        groupField = '$statusCode';
        break;
      default:
        groupField = '$endpoint';
    }

    const stats = await ApiLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupField,
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          successCount: {
            $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
          },
          errorCount: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          successCount: 1,
          errorCount: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ['$successCount', '$count'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // If grouping by user, populate user details
    if (groupBy === 'user') {
      await User.populate(stats, { path: '_id', select: 'name email' });
    }

    res.json({
      success: true,
      stats,
      groupBy
    });
  } catch (error) {
    logger.error('API usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get API usage statistics'
    });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const userStats = await User.aggregate([
      {
        $lookup: {
          from: 'apilogs',
          localField: '_id',
          foreignField: 'userId',
          as: 'apiLogs'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          lastLogin: 1,
          apiUsage: {
            totalCalls: { $size: '$apiLogs' },
            lastApiCall: { $max: '$apiLogs.createdAt' }
          }
        }
      },
      { $sort: { 'apiUsage.totalCalls': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    const total = await User.countDocuments();

    res.json({
      success: true,
      users: userStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user analytics'
    });
  }
};

// Get endpoint performance
exports.getEndpointPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const performance = await ApiLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$endpoint',
          totalCalls: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          successCount: {
            $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
          },
          errorCount: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
          },
          statusCodes: { $push: '$statusCode' }
        }
      },
      {
        $project: {
          endpoint: '$_id',
          totalCalls: 1,
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          minResponseTime: 1,
          maxResponseTime: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ['$successCount', '$totalCalls'] }, 100] },
              2
            ]
          },
          errorRate: {
            $round: [
              { $multiply: [{ $divide: ['$errorCount', '$totalCalls'] }, 100] },
              2
            ]
          },
          _id: 0
        }
      },
      { $sort: { totalCalls: -1 } }
    ]);

    res.json({
      success: true,
      performance
    });
  } catch (error) {
    logger.error('Endpoint performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get endpoint performance'
    });
  }
};

// Get trends
exports.getTrends = async (req, res) => {
  try {
    const { period = 'day', days = 7 } = req.query;
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    let groupFormat;
    switch (period) {
      case 'hour':
        groupFormat = { $hour: '$createdAt' };
        break;
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupFormat = { $week: '$createdAt' };
        break;
      case 'month':
        groupFormat = { $month: '$createdAt' };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const trends = await ApiLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $project: {
          period: '$_id',
          count: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ['$successCount', '$count'] }, 100] },
              2
            ]
          },
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          _id: 0
        }
      },
      { $sort: { period: 1 } }
    ]);

    res.json({
      success: true,
      trends,
      period,
      startDate,
      endDate
    });
  } catch (error) {
    logger.error('Trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trends'
    });
  }
};

// Get error analytics
exports.getErrorAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const match = { statusCode: { $gte: 400 } };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const errors = await ApiLog.find(match)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ApiLog.countDocuments(match);

    // Group errors by type
    const errorTypes = await ApiLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$statusCode',
          count: { $sum: 1 },
          endpoints: { $addToSet: '$endpoint' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      errors,
      errorTypes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get error analytics'
    });
  }
};

// Export analytics data
exports.exportAnalytics = async (req, res) => {
  try {
    const { type = 'csv', startDate, endDate } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const data = await ApiLog.find(match)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit export to 10k records

    if (type === 'csv') {
      const csv = [
        'Date,User,Email,Endpoint,Method,Status,Response Time (ms)',
        ...data.map(log => 
          `${format(log.createdAt, 'yyyy-MM-dd HH:mm:ss')},${log.userId?.name || 'N/A'},${log.userId?.email || 'N/A'},${log.endpoint},${log.method},${log.statusCode},${log.responseTime || 0}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: data.map(log => ({
          date: log.createdAt,
          user: log.userId?.name || 'N/A',
          email: log.userId?.email || 'N/A',
          endpoint: log.endpoint,
          method: log.method,
          status: log.statusCode,
          responseTime: log.responseTime || 0
        }))
      });
    }
  } catch (error) {
    logger.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics'
    });
  }
};