const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'user_photo', 'garment', 'template', 'result'],
    default: 'general'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  usedInProcessing: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
uploadSchema.index({ userId: 1, createdAt: -1 });
uploadSchema.index({ type: 1 });
uploadSchema.index({ tags: 1 });

// Virtual for file extension
uploadSchema.virtual('extension').get(function() {
  return this.filename.split('.').pop().toLowerCase();
});

// Virtual for is image
uploadSchema.virtual('isImage').get(function() {
  return /^image\//.test(this.mimetype);
});

// Static method to get storage statistics
uploadSchema.statics.getStorageStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: '$count' },
        totalSize: { $sum: '$totalSize' },
        byType: {
          $push: {
            type: '$_id',
            count: '$count',
            size: '$totalSize'
          }
        }
      }
    }
  ]);

  return stats[0] || { totalFiles: 0, totalSize: 0, byType: [] };
};

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;