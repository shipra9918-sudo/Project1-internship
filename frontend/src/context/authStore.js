import { create } from 'zustand';
import { authAPI } from '../services/api';
import websocketService from '../services/websocket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      
      // Connect WebSocket
      websocketService.connect(token);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      
      websocketService.connect(token);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    websocketService.disconnect();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ loading: true });
    try {
      const response = await authAPI.getProfile();
      set({ 
        user: response.data.data.user, 
        isAuthenticated: true, 
        loading: false 
      });
      
      websocketService.connect(token);
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      set({ user: response.data.data.user });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  }
}));
