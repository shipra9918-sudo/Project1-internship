import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateCourierLocation: (data) => api.put('/auth/courier/location', data)
};

// Restaurant API
export const restaurantAPI = {
  discover: (params) => api.get('/restaurants/discover', { params }),
  search: (params) => api.get('/restaurants/search', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  toggleMenuItem: (restaurantId, itemId, data) => 
    api.put(`/restaurants/${restaurantId}/menu/${itemId}/toggle`, data)
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getRestaurantOrders: (restaurantId, params) => 
    api.get(`/orders/restaurant/${restaurantId}`, { params })
};

// Payment API
export const paymentAPI = {
  checkout: (data) => api.post('/payments/checkout', data),
  verify: (transactionId) => api.get(`/payments/verify/${transactionId}`),
  refund: (data) => api.post('/payments/refund', data),
  getHistory: (params) => api.get('/payments/history', { params })
};

// Review API
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  suggestKeywords: (data) => api.post('/reviews/suggest-keywords', data),
  getRestaurantReviews: (restaurantId, params) => 
    api.get(`/reviews/restaurant/${restaurantId}`, { params }),
  markHelpful: (id, data) => api.put(`/reviews/${id}/helpful`, data),
  respond: (id, data) => api.put(`/reviews/${id}/respond`, data)
};

export default api;
