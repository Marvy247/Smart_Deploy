import { useState, useCallback, useMemo } from 'react'
import { 
  MemoizedVerificationStatus,
  MemoizedSecurityStatus,
  MemoizedDashboardSkeleton,
  DeploymentsTable,
  MemoizedGitHubCIStatus
} from './MemoizedComponents'
import SecurityMetricsChart from './charts/SecurityMetricsChart'
import SecurityScoreRadialChart from './charts/SecurityScoreRadialChart'
import GasUsageChart from './charts/GasUsageChart'
import ContractMetricsDashboard from './ContractMetricsDashboard'

interface DashboardProps {
  verification: {
    sourcify: boolean
    etherscan: boolean
    lastChecked: string // ISO string
  }
  security: {
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
  githubCI?: {
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
  deployments?: Array<{
    contractName: string
    network: string
    address: string
    deployer: string
    timestamp: string // ISO string
    txHash: string
    gasUsed: string | number
  }>
  contractAnalysis?: {
    size: {
      bytecode: number
      deployedBytecode: number
      sourceLines: number
    }
    gasAnalysis: {
      deploymentCost: number
      methodCosts: Array<{
        name: string
        cost: number
        optimization?: string
      }>
    }
    complexityScore: number
  }
  healthMetrics?: {
    contractSize: {
      current: number
      limit: number
      recommendation?: string
    }
    gasEfficiency: {
      score: number
      suggestions: Array<{
        type: string
        description: string
        impact: 'high' | 'medium' | 'low'
        potentialSavings?: string
      }>
    }
    testCoverage: {
      percentage: number
      uncoveredLines: number
      criticalFunctions: Array<string>
    }
    deploymentCosts: {
      estimated: string
      historical: Array<{
        network: string
        cost: string
        date: string
      }>
    }
  }
  isLoading?: boolean
  error?: string
}

export default function Dashboard({ 
  verification, 
  security, 
  githubCI, 
  deployments = [], 
  contractAnalysis,
  healthMetrics,
  isLoading, 
  error 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const paginatedDeployments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return deployments.slice(startIndex, startIndex + itemsPerPage)
  }, [deployments, currentPage, itemsPerPage])


  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1) // Reset to first page when changing tabs
  }, [])

  if (isLoading) {
    return <MemoizedDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <h3 className="text-lg font-medium">Error loading dashboard</h3>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
          <MemoizedVerificationStatus {...verification} />
        </div>
        <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
          <MemoizedSecurityStatus slither={{
            ...security,
            vulnerabilities: typeof security.vulnerabilities === 'number' ? 
              security.vulnerabilities : 
              security.vulnerabilities.total,
            detectorStats: security.detectorStats || {}
          }} />
        </div>
        {githubCI && (
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <MemoizedGitHubCIStatus {...githubCI} />
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange('deployments')}
            className={`${
              activeTab === 'deployments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Deployments
          </button>
          <button
            onClick={() => handleTabChange('security')}
            className={`${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security Analysis
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Contract Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Latest Deployment</h4>
                {deployments[0] ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Contract:</span> {deployments[0].contractName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Network:</span> {deployments[0].network}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Address:</span>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded">{deployments[0].address}</code>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No deployments yet</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Security Status</h4>
                <div className="space-y-4">
                  <div className="h-40">
                    <SecurityScoreRadialChart score={security.score} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Issues:</span>{' '}
                      {typeof security.vulnerabilities === 'number'
                        ? security.vulnerabilities
                        : security.vulnerabilities.total}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Last Scan:</span>{' '}
                      {new Date(security.lastRun).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Gas Usage</h3>
              <GasUsageChart
                deployments={deployments.map(d => ({
                  ...d,
                  timestamp: new Date(d.timestamp),
                  gasUsed: String(d.gasUsed),
                }))}
              />
            </div>
            <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <DeploymentsTable deployments={paginatedDeployments} />
              </div>
              {deployments.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {Math.ceil(deployments.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(deployments.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(deployments.length / itemsPerPage)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Security Analysis</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Vulnerability Breakdown</h4>
                  {typeof security.vulnerabilities !== 'number' && (
                    <SecurityMetricsChart vulnerabilities={security.vulnerabilities} />
                  )}
                </div>

                {security.detectorStats && Object.keys(security.detectorStats).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Detector Statistics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(security.detectorStats).map(([detector, count]) => (
                        <div key={detector} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{detector}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {security.reportUrl && (
                  <div className="mt-4">
                    <a
                      href={security.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      View Full Report
                    </a>
                  </div>
                )}
              </div>
            </div>

        {contractAnalysis && healthMetrics && (
          <div className="mt-6">
            <ContractMetricsDashboard metrics={{
              health: healthMetrics,
              analysis: contractAnalysis
            }} />
          </div>
        )}

          </div>
        )}
      </div>
    </div>
  )
}
