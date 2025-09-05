# GlamAI Admin Panel

A comprehensive admin panel and backend system for integrating with GlamAI's official APIs. This system provides a secure, scalable interface for managing AI-powered image processing capabilities including virtual try-on, beautification, and template overlays.

## 🚀 Features

### Core Functionality
- **Virtual Try-On**: Upload user photos and garment images to see how they look together
- **Image Beautification**: Apply AI-powered enhancements to photos
- **Template Management**: Browse and apply pre-designed templates and filters
- **Background Removal**: Remove backgrounds from images with AI precision
- **Style Transfer**: Apply artistic styles from one image to another
- **Batch Processing**: Process multiple images in a single operation

### Admin Features
- **User Management**: Create and manage admin users with role-based access control
- **API Monitoring**: Real-time monitoring of API usage and performance
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **File Management**: Secure upload and storage of images
- **Activity Logging**: Detailed logs of all API calls and user activities
- **Two-Factor Authentication**: Enhanced security with 2FA support

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** for data persistence
- **Redis** for caching and session management
- **JWT** for authentication
- **Multer** for file uploads
- **Winston** for logging
- **AWS S3** (optional) for cloud storage

### Frontend
- **React.js** with TypeScript
- **Material-UI** for UI components
- **React Router** for navigation
- **React Query** for data fetching
- **Recharts** for data visualization
- **React Hook Form** for form management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- GlamAI API credentials

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd glamai-admin-panel
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/glamai_admin
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=30d
OTP_SECRET=your_otp_secret_key

# GlamAI API Configuration
GLAMAI_API_BASE_URL=https://api.glam.ai/api/v1
GLAMAI_API_KEY=your_glamai_api_key_here

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the services

Start MongoDB and Redis:
```bash
# MongoDB
mongod

# Redis
redis-server
```

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend development server:
```bash
cd frontend
npm start
```

## 📁 Project Structure

```
glamai-admin-panel/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── uploads/            # Local file uploads
│   ├── logs/               # Application logs
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main app component
│   └── package.json
│
└── docs/                   # Documentation
```

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Sub-admin, Viewer)
- Permission-based feature access
- Two-factor authentication support

### API Security
- API keys stored securely in environment variables
- All API calls routed through backend to protect keys
- Rate limiting to prevent abuse
- Request validation and sanitization

### Data Security
- Passwords hashed with bcrypt
- HTTPS enforced in production
- MongoDB connection with authentication
- Secure session management with Redis

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA token

### GlamAI Integration
- `POST /api/glamai/tryon` - Virtual try-on
- `POST /api/glamai/beautify` - Image beautification
- `POST /api/glamai/template` - Apply template
- `POST /api/glamai/background/remove` - Remove background
- `POST /api/glamai/style/transfer` - Style transfer
- `POST /api/glamai/batch` - Batch processing
- `GET /api/glamai/templates` - Get available templates
- `GET /api/glamai/quota` - Check API quota

### File Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/user` - Upload user photo
- `POST /api/upload/garment` - Upload garment
- `POST /api/upload/batch` - Upload multiple files

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/api-usage` - API usage stats
- `GET /api/analytics/trends` - Usage trends
- `GET /api/analytics/export` - Export analytics data

## 🚀 Deployment

### Production Environment Setup

1. **Environment Variables**: Set all required environment variables for production
2. **Build Frontend**: 
   ```bash
   cd frontend
   npm run build
   ```
3. **Serve Static Files**: Configure backend to serve frontend build files
4. **Process Manager**: Use PM2 or similar for process management
5. **Reverse Proxy**: Set up Nginx or Apache as reverse proxy
6. **SSL Certificate**: Configure HTTPS with Let's Encrypt

### Docker Deployment (Optional)

Docker files are provided for containerized deployment:

```bash
# Build and run with docker-compose
docker-compose up -d
```

## 📈 Monitoring & Logging

- **Application Logs**: Stored in `backend/logs/`
- **API Call Logs**: Stored in MongoDB for analytics
- **Error Tracking**: Integrated error logging with Winston
- **Performance Monitoring**: Response time tracking for all API calls

## 🤝 API Integration Guide

### Making API Calls

All GlamAI API calls should be made through the backend endpoints. Example:

```javascript
// Virtual Try-On
const response = await fetch('/api/glamai/tryon', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userImageUrl: 'https://example.com/user.jpg',
    garmentImageUrl: 'https://example.com/garment.jpg',
    maskType: 'overall'
  })
});
```

### Handling Responses

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    "resultUrl": "https://api.glam.ai/results/xyz.jpg",
    "requestId": "req_123456"
  }
}
```

## 🧪 Testing

Run tests with:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review API logs for debugging
- Contact the development team

## 🔄 Updates & Maintenance

Regular updates should include:
- Security patches for dependencies
- API version compatibility checks
- Performance optimizations
- Feature enhancements based on usage analytics

---

Built with ❤️ for GlamAI integration