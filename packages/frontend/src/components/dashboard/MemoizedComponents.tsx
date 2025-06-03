import { memo } from 'react'
import VerificationStatus from './VerificationStatus'
import SecurityStatus from './SecurityStatus'
import { DashboardSkeleton } from './LoadingSkeleton'

export const MemoizedVerificationStatus = memo(VerificationStatus)
export const MemoizedSecurityStatus = memo(SecurityStatus)
export const MemoizedDashboardSkeleton = memo(DashboardSkeleton)

export const DeploymentsTable = memo(({ deployments }: { 
  deployments: Array<{
    contractName: string
    network: string
    address: string
    deployer: string
    timestamp: Date
    txHash: string
    gasUsed: string
  }>
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Contract
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Network
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Address
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Deployer
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {deployments.map((deployment, index) => (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {deployment.contractName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {deployment.network}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <code className="bg-gray-100 px-2 py-1 rounded">{deployment.address}</code>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {deployment.deployer}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {deployment.timestamp.toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
))

DeploymentsTable.displayName = 'DeploymentsTable'
