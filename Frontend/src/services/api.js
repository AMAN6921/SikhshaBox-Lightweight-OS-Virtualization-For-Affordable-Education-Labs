import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  verifyToken: async (token) => {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Container service
export const containerService = {
  getStatus: async () => {
    const response = await api.get('/containers/status');
    return response.data;
  },
  
  start: async () => {
    const response = await api.post('/containers/start');
    return response.data;
  },
  
  stop: async () => {
    const response = await api.post('/containers/stop');
    return response.data;
  },
  
  reset: async () => {
    const response = await api.post('/containers/reset');
    return response.data;
  }
};

// Admin service
export const adminService = {
  getAllContainers: async () => {
    const response = await api.get('/admin/containers');
    return response.data;
  },
  
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  getSystemStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};

export default api;