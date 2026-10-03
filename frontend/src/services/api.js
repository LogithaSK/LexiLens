import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const documentAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get('/documents'),
  get: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
  analyze: (id) => api.post(`/documents/${id}/analyze`),
  getClauses: (id) => api.get(`/documents/${id}/clauses`),
  getRisks: (id) => api.get(`/documents/${id}/risks`),
};

export const chatAPI = {
  ask: (documentId, question) => api.post('/chat', { documentId, question }),
  history: (documentId) => api.get(`/chat/history/${documentId}`),
};

export const translationAPI = {
  translate: (text, targetLanguage) => api.post('/translate', { text, targetLanguage }),
};

export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
};

export default api;
