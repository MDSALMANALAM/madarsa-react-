import axios from 'axios';
import { API_BASE } from '../config/config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
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

// API Helper Functions
export const apiGet = async (endpoint) => {
  const response = await api.get(endpoint);
  return response.data;
};

export const apiPost = async (endpoint, data) => {
  const response = await api.post(endpoint, data);
  return response.data;
};

export const apiPatch = async (endpoint, data) => {
  const response = await api.patch(endpoint, data);
  return response.data;
};

export const apiDelete = async (endpoint) => {
  const response = await api.delete(endpoint);
  return response.data;
};

export const apiUpload = async (endpoint, formData) => {
  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Download file (for reports)
export const apiDownload = async (endpoint, filename) => {
  try {
    const response = await api.get(endpoint, {
      responseType: 'blob'
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error: error.message };
  }
};

export default api;

