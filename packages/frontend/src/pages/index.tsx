import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Smart Deploy
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage and monitor your deployments with ease
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}
