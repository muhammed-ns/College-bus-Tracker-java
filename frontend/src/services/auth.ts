import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string):Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    if (response.data && response.data.token) {
      localStorage.setItem('bus_token', response.data.token);
      const user: User = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };
      localStorage.setItem('bus_user', JSON.stringify(user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('bus_token');
    localStorage.removeItem('bus_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('bus_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('bus_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('bus_token');
  },
};

export default authService;
