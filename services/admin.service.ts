import api from '../lib/axios';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  toggleUserBan: async (userId: number, is_banned: boolean) => {
    const response = await api.patch(`/admin/users/${userId}/ban`, { is_banned });
    return response.data;
  },
  getHeroes: async () => {
    const response = await api.get('/admin/heroes');
    return response.data;
  },
  createHero: async (formData: FormData) => {
    const response = await api.post('/admin/heroes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  deleteHero: async (heroId: number) => {
    const response = await api.delete(`/admin/heroes/${heroId}`);
    return response.data;
  },
  getWhatsAppStatus: async () => {
    const response = await api.get('/admin/whatsapp/status');
    return response.data;
  },
  getWhatsAppQR: async () => {
    const response = await api.get('/admin/whatsapp/qr');
    return response.data;
  }
};
