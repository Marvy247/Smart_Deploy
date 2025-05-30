import { useState, useEffect } from 'react';
// import api from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';

import { Project as FullProject } from '@/types/project';

const mockProjects: FullProject[] = [
  {
    id: '1',
    name: 'Mock Project 1',
    status: 'healthy',
    network: 'mainnet',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    lastDeployedAt: new Date().toISOString(),
    transactions: [
      { timestamp: new Date().toISOString(), value: 10, type: 'transaction' },
      { timestamp: new Date().toISOString(), value: 5, type: 'transaction' },
    ],
    events: [
      { type: 'Deployment', message: 'Deployed successfully', timestamp: new Date().toISOString() },
      { type: 'Test', message: 'All tests passed', timestamp: new Date().toISOString() },
    ],
  },
  {
    id: '2',
    name: 'Mock Project 2',
    status: 'warning',
    network: 'rinkeby',
    contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    lastDeployedAt: new Date().toISOString(),
    transactions: [
      { timestamp: new Date().toISOString(), value: 7, type: 'transaction' },
    ],
    events: [
      { type: 'Deployment', message: 'Deployment failed', timestamp: new Date().toISOString() },
    ],
  },
];

export function useProjects() {
  const [projects, setProjects] = useState<FullProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        // Return mock projects for testing
        setProjects(mockProjects);
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
