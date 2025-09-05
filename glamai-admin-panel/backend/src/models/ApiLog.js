const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed
  },
  statusCode: {
    type: Number
  },
  responseTime: {
    type: Number // in milliseconds
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
apiLogSchema.index({ userId: 1, createdAt: -1 });
apiLogSchema.index({ endpoint: 1, createdAt: -1 });
apiLogSchema.index({ statusCode: 1 });
apiLogSchema.index({ createdAt: -1 });

// Static method to get usage statistics
apiLogSchema.statics.getUsageStats = async function(userId, startDate, endDate) {
  const match = {
    userId: mongoose.Types.ObjectId(userId)
  };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          endpoint: '$endpoint',
          statusCode: '$statusCode'
        },
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' }
      }
    },
    {
      $group: {
        _id: '$_id.endpoint',
        total: { $sum: '$count' },
        successful: {
          $sum: {
            $cond: [{ $lt: ['$_id.statusCode', 400] }, '$count', 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $gte: ['$_id.statusCode', 400] }, '$count', 0]
          }
        },
        avgResponseTime: { $avg: '$avgResponseTime' }
      }
    },
    {
      $project: {
        endpoint: '$_id',
        total: 1,
        successful: 1,
        failed: 1,
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        successRate: {
          $round: [
            { $multiply: [{ $divide: ['$successful', '$total'] }, 100] },
            2
          ]
        },
        _id: 0
      }
    }
  ]);

  return stats;
};

// Static method to get hourly usage
apiLogSchema.statics.getHourlyUsage = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const hourlyUsage = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        hour: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);

  // Fill in missing hours with 0
  const fullHourlyUsage = Array.from({ length: 24 }, (_, i) => {
    const found = hourlyUsage.find(h => h.hour === i);
    return { hour: i, count: found ? found.count : 0 };
  });

  return fullHourlyUsage;
};

const ApiLog = mongoose.model('ApiLog', apiLogSchema);

module.exports = ApiLog;