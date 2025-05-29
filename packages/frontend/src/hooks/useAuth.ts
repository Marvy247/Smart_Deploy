import { useState, useEffect } from 'react';
import api from '../services/api';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async () => {
    try {
      const response = await api.post('/auth/login', {});
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return {
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };
}
