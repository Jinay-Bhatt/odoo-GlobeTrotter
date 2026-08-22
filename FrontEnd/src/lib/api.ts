import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('gt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Clear token on 401 if unauthorized and not already on auth pages
      const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      if (!isAuthPage) {
        localStorage.removeItem('gt_token');
        localStorage.removeItem('gt_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
