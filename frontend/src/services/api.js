import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateWebhookUrl = (data) => API.put('/auth/webhook', data);

export const createShortUrl = (data) => API.post('/url/shorten', data);
export const bulkCreateShortUrl = (data) => API.post('/url/bulk-shorten', data);
export const getMyUrls = () => API.get('/url/my-urls');
export const deleteUrl = (shortCode) => API.delete(`/url/${shortCode}`);
export const unlockUrl = (shortCode, password) => API.post(`/url/unlock/${shortCode}`, { password });

export const getUrlAnalytics = (shortCode) => API.get(`/analytics/${shortCode}`);
export const getDashboardStats = () => API.get('/analytics/dashboard');

export const getMyApiKeys = () => API.get('/keys');
export const generateApiKey = (data) => API.post('/keys', data);
export const revokeApiKey = (id) => API.delete(`/keys/${id}`);

export const getUrlHourlyAnalytics = (shortCode) => API.get(`/analytics/${shortCode}/hourly`);