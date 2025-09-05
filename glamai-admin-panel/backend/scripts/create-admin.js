require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const logger = require('../src/utils/logger');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      logger.info('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@glamai.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      permissions: [
        'view_analytics',
        'manage_users',
        'api_access',
        'upload_media',
        'manage_templates'
      ],
      isActive: true
    });

    logger.info('Admin user created successfully:', {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role
    });

    console.log('\n===========================================');
    console.log('Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
    console.log('Please change the password after first login');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('Failed to create admin user:', error);
    process.exit(1);
  }
}

createAdminUser();