import api from '../lib/axios';

export const authService = {
  login: async (phone: string, password?: string) => {
    const response = await api.post('/auth/login', { phone, password });
    return response.data;
  },

  requestOTP: async (phone: string) => {
    const response = await api.post('/auth/request-otp', { phone });
    return response.data;
  },

  register: async (phone: string, code: string, name: string, city: string, password?: string) => {
    const response = await api.post('/auth/register', { phone, code, name, city, password });
    return response.data;
  },

  resetPassword: async (phone: string, code: string, newPassword?: string) => {
    const response = await api.post('/auth/reset-password', { phone, code, newPassword });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};
