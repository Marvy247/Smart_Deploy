import { useState } from 'react';

export default function Home() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'Project Alpha', status: 'Active' },
    { id: 2, name: 'Project Beta', status: 'Deploying' },
  ]);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Smart Deploy Dashboard</h1>
      <section>
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li key={project.id} className="p-4 border rounded shadow-sm flex justify-between items-center">
              <span>{project.name}</span>
              <span className="text-sm font-medium text-gray-600">{project.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
