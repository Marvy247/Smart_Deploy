import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Smart Deploy</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/"
                className="inline-flex items-center px-1 pt-1 text-gray-900"
              >
                Dashboard
              </Link>
              <Link 
                href="/projects"
                className="inline-flex items-center px-1 pt-1 text-gray-900"
              >
                Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
