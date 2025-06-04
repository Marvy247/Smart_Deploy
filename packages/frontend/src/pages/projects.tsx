import { useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useAuthContext } from '../contexts/AuthContext';

export default function ProjectsPage() {
  const { projects, loading: projectsLoading, error } = useProjects();
  const { login, isAuthenticated, loading: authLoading } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      login();
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Authenticating...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                project.status === 'healthy' 
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : project.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
