import React from 'react'

interface VerificationStatusProps {
  sourcify: boolean
  etherscan: boolean
  lastChecked: string // ISO string
}

interface SlitherResult {
  vulnerabilities: number | {
    high: number
    medium: number
    low: number
    informational: number
    total: number
  }
  warnings: number
  optimizations: number
  score: number
  reportUrl?: string
  lastRun: string // ISO string
  detectorStats?: Record<string, number>
}

interface GitHubCIProps {
  status: 'success' | 'failure' | 'pending'
  branch: string
  lastCommit: {
    hash: string
    message: string
    timestamp: string // ISO string
  }
  workflowName: string
  workflowUrl?: string
}

interface Deployment {
  contractName: string
  network: string
  address: string
  deployer: string
  timestamp: string // ISO string
  txHash: string
  gasUsed: string | number
}


export const MemoizedVerificationStatus = React.memo(function VerificationStatus(props: VerificationStatusProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Verification Status</h4>
      <div className="space-y-1">
        <p className="text-sm">
          <span className="font-medium">Sourcify:</span>{' '}
          {props.sourcify ? (
            <span className="text-green-600">Verified</span>
          ) : (
            <span className="text-red-600">Not Verified</span>
          )}
        </p>
        <p className="text-sm">
          <span className="font-medium">Etherscan:</span>{' '}
          {props.etherscan ? (
            <span className="text-green-600">Verified</span>
          ) : (
            <span className="text-red-600">Not Verified</span>
          )}
        </p>
      </div>
      <p className="text-sm text-gray-500">
        Last checked: {new Date(props.lastChecked).toLocaleDateString()}
      </p>
    </div>
  )
})

export const MemoizedSecurityStatus = React.memo(function SecurityStatus({ slither }: { slither: SlitherResult }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Security Status</h4>
      <div className="space-y-1">
        <p className="text-sm">
          <span className="font-medium">Vulnerabilities:</span>{' '}
          {typeof slither.vulnerabilities === 'number'
            ? slither.vulnerabilities
            : slither.vulnerabilities.total}
        </p>
        <p className="text-sm">
          <span className="font-medium">Warnings:</span> {slither.warnings}
        </p>
        <p className="text-sm">
          <span className="font-medium">Optimizations:</span> {slither.optimizations}
        </p>
        <p className="text-sm">
          <span className="font-medium">Score:</span> {slither.score}/100
        </p>
      </div>
      <p className="text-sm text-gray-500">
        Last run: {new Date(slither.lastRun).toLocaleDateString()}
      </p>
    </div>
  )
})

export const MemoizedGitHubCIStatus = React.memo(function GitHubCIStatus(props: GitHubCIProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">CI Status</h4>
      <div className="space-y-1">
        <p className="text-sm">
          <span className="font-medium">Branch:</span> {props.branch}
        </p>
        <p className="text-sm">
          <span className="font-medium">Status:</span>{' '}
          {props.status === 'success' ? (
            <span className="text-green-600">Passed</span>
          ) : props.status === 'failure' ? (
            <span className="text-red-600">Failed</span>
          ) : (
            <span className="text-yellow-600">Pending</span>
          )}
        </p>
        <p className="text-sm">
          <span className="font-medium">Workflow:</span> {props.workflowName}
        </p>
      </div>
      <p className="text-sm text-gray-500">
        {new Date(props.lastCommit.timestamp).toLocaleDateString()}
      </p>
    </div>
  )
})

export const DeploymentsTable = React.memo(function DeploymentsTable({ deployments }: { deployments: Deployment[] }) {
  return (
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
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Gas Used
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {deployments.map((deployment) => (
          <tr key={`${deployment.network}-${deployment.address}`}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {deployment.contractName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {deployment.network}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
              {deployment.address}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
              {deployment.deployer}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(deployment.timestamp).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {deployment.gasUsed}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
})

export const MemoizedDashboardSkeleton = React.memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-b border-gray-200">
        <div className="-mb-px flex space-x-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
