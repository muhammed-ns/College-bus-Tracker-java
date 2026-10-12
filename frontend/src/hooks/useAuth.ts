import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { User, Role } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const navigate = useNavigate();

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setToken(authService.getToken());
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    setUser({
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role,
    });
    setToken(res.token);

    // Redirect based on role
    if (res.role === 'ADMIN') {
      navigate('/admin');
    } else if (res.role === 'DRIVER') {
      navigate('/driver');
    } else {
      navigate('/student');
    }
    return res;
  };

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    navigate('/login');
  }, [navigate]);

  return {
    user,
    token,
    role: user?.role as Role | undefined,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };
};

export default useAuth;
