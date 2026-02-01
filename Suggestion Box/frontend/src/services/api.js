import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
};

// Box API
export const boxAPI = {
  getPublicBoxes: (params) => api.get('/boxes', { params }),
  getMyBoxes: () => api.get('/boxes/user/my'),
  getBox: (boxId) => api.get(`/boxes/${boxId}`),
  createBox: (data) => api.post('/boxes', data),
  updateBox: (boxId, data) => api.put(`/boxes/${boxId}`, data),
  deleteBox: (boxId) => api.delete(`/boxes/${boxId}`),
  verifyPasskey: (boxId, passkey) => api.post(`/boxes/${boxId}/verify`, { passkey }),
};

// Suggestion API
export const suggestionAPI = {
  create: (boxId, data) => api.post(`/suggestions/${boxId}`, data),
  getForBox: (boxId, params) => api.get(`/suggestions/${boxId}`, { params }),
  update: (id, data) => api.put(`/suggestions/${id}`, data),
  delete: (id) => api.delete(`/suggestions/${id}`),
  clearAll: (boxId) => api.delete(`/suggestions/${boxId}/clear`),
  addReaction: (id, emoji) => api.post(`/suggestions/${id}/react`, { emoji }),
  reply: (id, message) => api.post(`/suggestions/${id}/reply`, { message }),
  getInbox: () => api.get('/suggestions/user/inbox'),
  markAsRead: (id) => api.put(`/suggestions/${id}/read`),
};

export default api;
