// services/api.js — single axios instance for the whole app.
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({ baseURL: `${API_URL}/api` });

// Attach the JWT to every request automatically
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is rejected (expired), log out gracefully
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('sb_token');
      sessionStorage.removeItem('sb_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
