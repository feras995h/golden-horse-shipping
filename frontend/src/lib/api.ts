import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login only if we're in admin area
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect to admin login if we're already in admin area
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data: any) =>
    api.patch('/auth/profile', data),
  
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Clients API
export const clientsAPI = {
  getAll: (params?: any) =>
    api.get('/clients', { params }),
  
  getById: (id: string) =>
    api.get(`/clients/${id}`),
  
  getByClientId: (clientId: string) =>
    api.get(`/clients/by-client-id/${clientId}`),
  
  getClientShipments: (clientId: string) =>
    api.get(`/clients/${clientId}/shipments`),
  
  create: (data: any) =>
    api.post('/clients', data),
  
  update: (id: string, data: any) =>
    api.patch(`/clients/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/clients/${id}`),
  
  toggleStatus: (id: string) =>
    api.patch(`/clients/${id}/toggle-status`),
  
  getStats: () =>
    api.get('/clients/stats'),

  changePassword: (id: string, data: { newPassword: string }) =>
    api.patch(`/clients/${id}/change-password`, data),

  resetPassword: (id: string) =>
    api.post(`/clients/${id}/reset-password`),
};

// Shipments API
export const shipmentsAPI = {
  getAll: (params?: any) =>
    api.get('/shipments', { params }),
  
  getById: (id: string) =>
    api.get(`/shipments/${id}`),
  
  getByTrackingNumber: (trackingNumber: string) =>
    api.get(`/shipments/tracking/${trackingNumber}`),

  getPublicTracking: (trackingNumber: string) =>
    api.get(`/shipments/${trackingNumber}/public`),

  getRealTimeTracking: (id: string) =>
    api.get(`/shipments/${id}/tracking`),

  getPublicTrackingByNumber: (trackingNumber: string) =>
    api.get(`/shipments/track/${trackingNumber}`),
  
  create: (data: any) =>
    api.post('/shipments', data),
  
  update: (id: string, data: any) =>
    api.patch(`/shipments/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/shipments/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/shipments/${id}/status`, { status }),
  
  updatePaymentStatus: (id: string, paymentStatus: string) =>
    api.patch(`/shipments/${id}/payment-status`, { paymentStatus }),
  
  addPaymentRecord: (id: string, paymentData: any) =>
    api.post(`/shipments/${id}/payments`, paymentData),
  
  getStats: () =>
    api.get('/shipments/stats'),
};

// Ads API
export const adsAPI = {
  getAll: (params?: any) =>
    api.get('/ads', { params }),
  
  getActive: () =>
    api.get('/ads/active'),
  
  getById: (id: string) =>
    api.get(`/ads/${id}`),
  
  create: (data: FormData) =>
    api.post('/ads', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: string, data: FormData) =>
    api.patch(`/ads/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  delete: (id: string) =>
    api.delete(`/ads/${id}`),
  
  updateStatus: (id: string, status: 'active' | 'inactive' | 'expired') =>
    api.patch(`/ads/${id}/status`, { status }),
  
  incrementView: (id: string) =>
    api.post(`/ads/${id}/view`),
  
  incrementClick: (id: string) =>
    api.post(`/ads/${id}/click`),
  
  getStats: () =>
    api.get('/ads/stats'),
};

// (Removed) Vessel Tracking API - legacy module has been removed

// ShipsGo Tracking API (Real-time)
export const shipsGoAPI = {
  trackByContainer: (containerNumber: string) =>
    api.get(`/shipsgo-tracking/container/${containerNumber}`),

  trackByBL: (blNumber: string) =>
    api.get(`/shipsgo-tracking/bl/${blNumber}`),

  trackByBooking: (bookingNumber: string) =>
    api.get(`/shipsgo-tracking/booking/${bookingNumber}`),

  getVesselPosition: (mmsi: string) =>
    api.get(`/shipsgo-tracking/vessel/${mmsi}/position`),

  trackShipment: (params: { container?: string; bl?: string; booking?: string }) =>
    api.get('/shipsgo-tracking/track', { params }),

  getHealth: () => api.get('/shipsgo-tracking/health'),
};

// Reports API
export const reportsAPI = {
  getShipmentReports: (params?: any) =>
    api.get('/reports/shipments', { params }),
  
  getPaymentReports: (params?: any) =>
    api.get('/reports/payments', { params }),
  
  getDashboardStats: () =>
    api.get('/reports/dashboard'),
  
  getDelayedShipments: () =>
    api.get('/reports/delayed-shipments'),
  
  getUnpaidShipments: () =>
    api.get('/reports/unpaid-shipments'),
  
  getAdvancedStats: (params?: any) =>
    api.get('/reports/advanced-stats', { params }),
  
  exportShipmentsCsv: (params?: any) =>
    api.get('/reports/shipments/export', { 
      params,
      responseType: 'blob'
    }),
  
  exportPaymentsCsv: (params?: any) =>
    api.get('/reports/payments/export', { 
      params,
      responseType: 'blob'
    }),
};

// File upload utility
export const uploadFile = (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

// Users API
export const usersAPI = {
  getAll: (params?: any) =>
    api.get('/users', { params }),

  getById: (id: string) =>
    api.get(`/users/${id}`),

  create: (data: any) =>
    api.post('/users', data),

  update: (id: string, data: any) =>
    api.patch(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete(`/users/${id}`),

  toggleStatus: (id: string) =>
    api.patch(`/users/${id}/toggle-status`),

  changeRole: (id: string, role: string) =>
    api.patch(`/users/${id}/change-role`, { role }),

  getStats: () =>
    api.get('/users/stats'),
};

// Settings API
export const settingsAPI = {
  getAll: () =>
    api.get('/settings'),

  getPublic: () =>
    api.get('/settings/public'),

  update: (data: any) =>
    api.patch('/settings', data),

  createBackup: () =>
    api.post('/settings/backup'),

  listBackups: () =>
    api.get('/settings/backup/list'),

  restoreBackup: (filename: string) =>
    api.post(`/settings/backup/${filename}/restore`),

  getSystemInfo: () =>
    api.get('/settings/system-info'),
};

// Generic API helper
export const apiRequest = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.request({
    method,
    url,
    data,
    ...config,
  });
  return response.data;
};

export default api;
