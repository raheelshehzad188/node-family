const axios = require('axios');
const logger = require('../../utils/logger');
const User = require('../../models/User');

class GlamAIService {
  constructor() {
    this.apiBaseUrl = process.env.GLAMAI_API_BASE_URL;
    this.apiKey = process.env.GLAMAI_API_KEY;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`GlamAI API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('GlamAI API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`GlamAI API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('GlamAI API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Virtual Try-On
  async virtualTryOn(params) {
    try {
      const { userImageUrl, garmentImageUrl, maskType = 'overall', userId } = params;

      const requestData = {
        mask_type: maskType,
        media_url: userImageUrl,
        garment_url: garmentImageUrl
      };

      const response = await this.client.post('/tryon', requestData);

      // Update user API usage
      if (userId) {
        await this.updateApiUsage(userId);
      }

      return {
        success: true,
        data: response.data,
        requestId: response.headers['x-request-id'] || null
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Image Beautification
  async beautifyImage(params) {
    try {
      const { imageUrl, beautificationLevel = 'medium', features = [], userId } = params;

      const requestData = {
        image_url: imageUrl,
        level: beautificationLevel,
        features: features
      };

      const response = await this.client.post('/beautify', requestData);

      // Update user API usage
      if (userId) {
        await this.updateApiUsage(userId);
      }

      return {
        success: true,
        data: response.data,
        requestId: response.headers['x-request-id'] || null
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Apply Template/Filter
  async applyTemplate(params) {
    try {
      const { imageUrl, templateId, intensity = 1.0, userId } = params;

      const requestData = {
        image_url: imageUrl,
        template_id: templateId,
        intensity: intensity
      };

      const response = await this.client.post('/templates/apply', requestData);

      // Update user API usage
      if (userId) {
        await this.updateApiUsage(userId);
      }

      return {
        success: true,
        data: response.data,
        requestId: response.headers['x-request-id'] || null
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get Available Templates
  async getTemplates(params = {}) {
    try {
      const { category, page = 1, limit = 20 } = params;

      const response = await this.client.get('/templates', {
        params: {
          category,
          page,
          limit
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Background Removal
  async removeBackground(params) {
    try {
      const { imageUrl, outputFormat = 'png', userId } = params;

      const requestData = {
        image_url: imageUrl,
        output_format: outputFormat
      };

      const response = await this.client.post('/background/remove', requestData);

      // Update user API usage
      if (userId) {
        await this.updateApiUsage(userId);
      }

      return {
        success: true,
        data: response.data,
        requestId: response.headers['x-request-id'] || null
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Style Transfer
  async styleTransfer(params) {
    try {
      const { contentImageUrl, styleImageUrl, strength = 0.5, userId } = params;

      const requestData = {
        content_url: contentImageUrl,
        style_url: styleImageUrl,
        strength: strength
      };

      const response = await this.client.post('/style/transfer', requestData);

      // Update user API usage
      if (userId) {
        await this.updateApiUsage(userId);
      }

      return {
        success: true,
        data: response.data,
        requestId: response.headers['x-request-id'] || null
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get Processing Status
  async getStatus(requestId) {
    try {
      const response = await this.client.get(`/status/${requestId}`);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Batch Processing
  async batchProcess(params) {
    try {
      const { operations, userId } = params;

      const requestData = {
        operations: operations
      };

      const response = await this.client.post('/batch', requestData);

      // Update user API usage
      if (userId) {
        await this.updateApiUsage(userId, operations.length);
      }

      return {
        success: true,
        data: response.data,
        batchId: response.data.batch_id
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Get Batch Status
  async getBatchStatus(batchId) {
    try {
      const response = await this.client.get(`/batch/${batchId}`);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Update user API usage
  async updateApiUsage(userId, count = 1) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { 'apiUsage.totalCalls': count },
        'apiUsage.lastApiCall': new Date()
      });
    } catch (error) {
      logger.error('Failed to update API usage:', error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // API returned an error response
      const { status, data } = error.response;
      
      let errorMessage = data.error || data.message || 'GlamAI API error';
      
      switch (status) {
        case 400:
          errorMessage = `Bad Request: ${errorMessage}`;
          break;
        case 401:
          errorMessage = 'Unauthorized: Invalid API key';
          break;
        case 403:
          errorMessage = 'Forbidden: Access denied';
          break;
        case 404:
          errorMessage = 'Not Found: Resource not found';
          break;
        case 429:
          errorMessage = 'Rate Limit Exceeded: Too many requests';
          break;
        case 500:
          errorMessage = 'GlamAI Server Error';
          break;
        default:
          errorMessage = `GlamAI API Error: ${errorMessage}`;
      }

      return {
        success: false,
        error: errorMessage,
        statusCode: status,
        details: data
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        success: false,
        error: 'No response from GlamAI API',
        details: 'The request was made but no response was received'
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: 'Failed to make request to GlamAI API',
        details: error.message
      };
    }
  }

  // Validate API Key
  async validateApiKey() {
    try {
      const response = await this.client.get('/validate');
      return {
        success: true,
        valid: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: this.handleError(error)
      };
    }
  }

  // Get API Usage/Quota
  async getApiQuota() {
    try {
      const response = await this.client.get('/quota');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Export singleton instance
module.exports = new GlamAIService();