import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';

export interface Project {
  id: number;
  name: string;
  status: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    async function fetchProjects() {
      if (!isAuthenticated) {
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get<Project[]>('/projects');
        setProjects(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [isAuthenticated]);

  return { projects, loading, error };
}
