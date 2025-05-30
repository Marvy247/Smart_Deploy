import { useState, useEffect } from 'react';
import api from '../services/api';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
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

  const githubLogin = async () => {
    try {
      // Initiate GitHub OAuth flow
      window.location.href = '/auth/github';
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    // Handle GitHub OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const githubToken = urlParams.get('token');
    if (githubToken) {
      localStorage.setItem('githubToken', githubToken);
      setGithubToken(githubToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return {
    token,
    githubToken,
    loading,
    login,
    githubLogin,
    handleGithubCallback: async (code: string) => {
      try {
        const response = await api.post('/auth/github/callback', { code });
        const { token } = response.data;
        localStorage.setItem('githubToken', token);
        setGithubToken(token);
      } catch (error) {
        console.error('GitHub callback failed:', error);
        throw error;
      }
    },
    logout,
    isAuthenticated: !!token,
    isGitHubAuthenticated: !!githubToken
  };
}
