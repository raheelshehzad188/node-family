import api from '../utils/api';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: any;
  requiresOTP?: boolean;
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  token: string;
  user: any;
}

class AuthService {
  async login(email: string, password: string, otpToken?: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
      otpToken,
    });
    return response.data;
  }

  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.user;
  }

  async enable2FA() {
    const response = await api.post('/auth/2fa/enable');
    return response.data;
  }

  async verify2FA(token: string) {
    const response = await api.post('/auth/2fa/verify', { token });
    return response.data;
  }

  async disable2FA(password: string) {
    const response = await api.post('/auth/2fa/disable', { password });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string) {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    const response = await api.put('/auth/update-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }
}

export default new AuthService();