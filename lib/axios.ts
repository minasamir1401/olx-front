import axios from 'axios';

const api = axios.create({
  // Auto-detect production API URL or fallback to env/local
  baseURL: typeof window !== 'undefined' && window.location.hostname.includes('red-gate.tech')
    ? 'https://olxnar-api.red-gate.tech/api'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'),
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
