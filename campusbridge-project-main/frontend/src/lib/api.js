import axios from 'axios';

/**
 * API client with Vite proxy baseURL '/api' → http://localhost:5000
 * Usage: api.get('/admin/users'), api.post('/login', data)
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token from localStorage
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;

