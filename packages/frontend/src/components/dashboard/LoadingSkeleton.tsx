export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="animate-pulse bg-gray-200 rounded h-[120px] w-full"></div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="animate-pulse bg-gray-200 rounded h-[120px] w-full"></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {['Overview', 'Deployments', 'Security'].map((tab) => (
            <div 
              key={tab}
              className="animate-pulse bg-gray-200 rounded h-10 w-24 mx-1"
            />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="animate-pulse bg-gray-200 rounded h-[300px] w-full"></div>
        </div>
      </div>
    </div>
  )
}
