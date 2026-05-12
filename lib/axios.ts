import axios from 'axios';

const api = axios.create({
  // Auto-detect production API URL or fallback to env/local
  baseURL: typeof window !== 'undefined' && window.location.hostname.includes('red-gate.tech')
    ? 'https://olxnar-api.red-gate.tech/api'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'),
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage', e);
      }
    }
  }
  return config;
});

export default api;
