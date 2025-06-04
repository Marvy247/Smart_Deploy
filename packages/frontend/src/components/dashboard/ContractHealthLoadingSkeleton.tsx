import { Card, Title } from '@tremor/react'

export function ContractHealthLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Title className="bg-gray-200 h-6 w-48 rounded" />
      
      {/* Contract Size Card Skeleton */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-gray-200 h-5 w-24 rounded" />
            <div className="bg-gray-200 h-5 w-32 rounded" />
          </div>
          <div className="bg-gray-200 h-2 w-full rounded" />
          <div className="bg-gray-200 h-4 w-3/4 rounded" />
        </div>
      </Card>

      {/* Gas Efficiency Card Skeleton */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-gray-200 h-5 w-36 rounded" />
            <div className="bg-gray-200 h-5 w-16 rounded" />
          </div>
          <div className="bg-gray-200 h-2 w-full rounded" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start space-x-2">
                <div className="bg-gray-200 h-5 w-16 rounded" />
                <div className="space-y-2 flex-1">
                  <div className="bg-gray-200 h-4 w-full rounded" />
                  <div className="bg-gray-200 h-4 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Test Coverage Card Skeleton */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-gray-200 h-5 w-24 rounded" />
            <div className="bg-gray-200 h-5 w-28 rounded" />
          </div>
          <div className="bg-gray-200 h-2 w-full rounded" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-200 h-4 w-full rounded" />
            ))}
          </div>
        </div>
      </Card>

      {/* Deployment Costs Card Skeleton */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-gray-200 h-5 w-40 rounded" />
            <div className="bg-gray-200 h-5 w-24 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="bg-gray-200 h-4 w-32 rounded" />
                <div className="bg-gray-200 h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
