import api from '../lib/axios';
import { Ad, Category } from '../types';

export const adService = {
  getAds: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/ads', { params });
    return response.data;
  },

  getAdDetails: async (slug: string) => {
    const response = await api.get(`/ads/${slug}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/ads/categories');
    return response.data;
  },

  createAd: async (formData: FormData) => {
    const response = await api.post('/ads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getPendingAds: async () => {
    const response = await api.get('/ads/pending');
    return response.data;
  },

  updateAdStatus: async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.patch(`/ads/${id}/status`, { status });
    return response.data;
  }
};
