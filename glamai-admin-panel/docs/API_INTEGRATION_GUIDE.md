# GlamAI API Integration Guide

This guide provides detailed information on integrating with the GlamAI API through the admin panel backend.

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Formats](#requestresponse-formats)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Best Practices](#best-practices)

## Authentication

All API requests require authentication using JWT tokens.

### Obtaining a Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Using the Token

Include the token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Virtual Try-On

Applies a garment to a user photo.

```bash
POST /api/glamai/tryon
Authorization: Bearer <token>
Content-Type: application/json

{
  "userImageUrl": "https://example.com/user-photo.jpg",
  "garmentImageUrl": "https://example.com/garment.jpg",
  "maskType": "overall" // options: overall, upper, lower
}
```

### Image Beautification

Enhances photos with AI-powered beautification.

```bash
POST /api/glamai/beautify
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://example.com/photo.jpg",
  "beautificationLevel": "medium", // options: low, medium, high
  "features": ["skin_smoothing", "teeth_whitening", "eye_enhancement"]
}
```

### Template Application

Applies pre-designed templates or filters to images.

```bash
POST /api/glamai/template
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://example.com/photo.jpg",
  "templateId": "template_123",
  "intensity": 0.8 // 0.0 to 1.0
}
```

### Background Removal

Removes background from images.

```bash
POST /api/glamai/background/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://example.com/photo.jpg",
  "outputFormat": "png" // options: png, jpg, webp
}
```

### Style Transfer

Applies artistic style from one image to another.

```bash
POST /api/glamai/style/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentImageUrl": "https://example.com/content.jpg",
  "styleImageUrl": "https://example.com/style.jpg",
  "strength": 0.5 // 0.0 to 1.0
}
```

### Batch Processing

Process multiple operations in a single request.

```bash
POST /api/glamai/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "operations": [
    {
      "type": "tryon",
      "params": {
        "userImageUrl": "https://example.com/user1.jpg",
        "garmentImageUrl": "https://example.com/garment1.jpg"
      }
    },
    {
      "type": "beautify",
      "params": {
        "imageUrl": "https://example.com/photo2.jpg",
        "beautificationLevel": "high"
      }
    }
  ]
}
```

## Request/Response Formats

### Standard Success Response

```json
{
  "success": true,
  "data": {
    "resultUrl": "https://api.glam.ai/results/processed-image.jpg",
    "requestId": "req_abc123",
    "processingTime": 245
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "code": "INVALID_IMAGE",
    "field": "userImageUrl"
  }
}
```

### Asynchronous Processing

For long-running operations, check status using:

```bash
GET /api/glamai/status/:requestId
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "completed", // pending, processing, completed, failed
    "progress": 100,
    "resultUrl": "https://api.glam.ai/results/processed-image.jpg"
  }
}
```

## Error Handling

### HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "statusCode": 400,
  "details": {
    "field": "imageUrl",
    "reason": "Invalid URL format"
  }
}
```

## Rate Limiting

API calls are rate limited to prevent abuse:

- **Default limit**: 100 requests per 15 minutes
- **Batch operations**: Count as multiple requests
- **Headers returned**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Best Practices

### 1. Image Upload Workflow

1. Upload image to backend first:
   ```bash
   POST /api/upload/image
   ```
2. Get the uploaded image URL
3. Use the URL in GlamAI API calls

### 2. Error Handling

Always implement proper error handling:

```javascript
try {
  const response = await fetch('/api/glamai/tryon', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  
  if (!result.success) {
    // Handle API error
    console.error('API Error:', result.error);
    return;
  }
  
  // Process successful result
  console.log('Result URL:', result.data.resultUrl);
} catch (error) {
  // Handle network or other errors
  console.error('Request failed:', error);
}
```

### 3. Batch Processing

For multiple operations, use batch processing to reduce API calls:

```javascript
const operations = images.map(img => ({
  type: 'beautify',
  params: {
    imageUrl: img.url,
    beautificationLevel: 'medium'
  }
}));

const response = await fetch('/api/glamai/batch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ operations })
});
```

### 4. Caching

Implement caching for frequently accessed data:

- Template lists
- Processing results
- User preferences

### 5. Monitoring

Monitor API usage through the analytics dashboard:

- Track success/failure rates
- Monitor response times
- Identify usage patterns

## WebSocket Support (Future)

For real-time updates on processing status:

```javascript
const ws = new WebSocket('wss://api.yourdomain.com/ws');

ws.on('message', (data) => {
  const update = JSON.parse(data);
  if (update.type === 'processing_update') {
    console.log(`Processing ${update.progress}% complete`);
  }
});
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { GlamAIClient } from '@glamai/admin-sdk';

const client = new GlamAIClient({
  apiKey: process.env.GLAMAI_API_KEY,
  baseUrl: 'https://api.yourdomain.com'
});

// Virtual try-on
const result = await client.virtualTryOn({
  userImageUrl: 'https://example.com/user.jpg',
  garmentImageUrl: 'https://example.com/garment.jpg',
  maskType: 'overall'
});

console.log('Result:', result.resultUrl);
```

### Python

```python
from glamai_admin import GlamAIClient

client = GlamAIClient(
    api_key=os.environ['GLAMAI_API_KEY'],
    base_url='https://api.yourdomain.com'
)

# Image beautification
result = client.beautify_image(
    image_url='https://example.com/photo.jpg',
    beautification_level='medium',
    features=['skin_smoothing', 'eye_enhancement']
)

print(f"Result: {result['result_url']}")
```

## Support

For API support:
- Check the API status page
- Review error logs in the admin panel
- Contact technical support with request IDs