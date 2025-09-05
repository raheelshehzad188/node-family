require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Create indexes
    const db = mongoose.connection.db;

    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    logger.info('Created indexes for users collection');

    // API logs collection indexes
    await db.collection('apilogs').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('apilogs').createIndex({ endpoint: 1, createdAt: -1 });
    await db.collection('apilogs').createIndex({ statusCode: 1 });
    await db.collection('apilogs').createIndex({ createdAt: -1 });
    logger.info('Created indexes for apilogs collection');

    // Uploads collection indexes
    await db.collection('uploads').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('uploads').createIndex({ type: 1 });
    await db.collection('uploads').createIndex({ tags: 1 });
    logger.info('Created indexes for uploads collection');

    logger.info('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();