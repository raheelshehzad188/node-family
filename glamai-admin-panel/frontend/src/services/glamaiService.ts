import api from '../utils/api';

interface TryOnParams {
  userImageUrl: string;
  garmentImageUrl: string;
  maskType?: string;
}

interface BeautifyParams {
  imageUrl: string;
  beautificationLevel?: string;
  features?: string[];
}

interface TemplateParams {
  imageUrl: string;
  templateId: string;
  intensity?: number;
}

interface BackgroundRemovalParams {
  imageUrl: string;
  outputFormat?: string;
}

interface StyleTransferParams {
  contentImageUrl: string;
  styleImageUrl: string;
  strength?: number;
}

interface BatchOperation {
  type: 'tryon' | 'beautify' | 'template' | 'background' | 'style';
  params: any;
}

class GlamAIService {
  async virtualTryOn(params: TryOnParams) {
    const response = await api.post('/glamai/tryon', params);
    return response.data;
  }

  async beautifyImage(params: BeautifyParams) {
    const response = await api.post('/glamai/beautify', params);
    return response.data;
  }

  async applyTemplate(params: TemplateParams) {
    const response = await api.post('/glamai/template', params);
    return response.data;
  }

  async removeBackground(params: BackgroundRemovalParams) {
    const response = await api.post('/glamai/background/remove', params);
    return response.data;
  }

  async styleTransfer(params: StyleTransferParams) {
    const response = await api.post('/glamai/style/transfer', params);
    return response.data;
  }

  async batchProcess(operations: BatchOperation[]) {
    const response = await api.post('/glamai/batch', { operations });
    return response.data;
  }

  async getProcessingStatus(requestId: string) {
    const response = await api.get(`/glamai/status/${requestId}`);
    return response.data;
  }

  async getBatchStatus(batchId: string) {
    const response = await api.get(`/glamai/batch/${batchId}`);
    return response.data;
  }

  async getTemplates(params?: { category?: string; page?: number; limit?: number }) {
    const response = await api.get('/glamai/templates', { params });
    return response.data;
  }

  async getApiQuota() {
    const response = await api.get('/glamai/quota');
    return response.data;
  }

  async validateApiKey() {
    const response = await api.get('/glamai/validate');
    return response.data;
  }

  // Helper function to upload image and get URL
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  }
}

export default new GlamAIService();