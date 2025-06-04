import Dashboard from '@/components/dashboard/Dashboard'
import { DashboardSkeleton } from '@/components/dashboard/LoadingSkeleton'
import ContractHealthDashboard from '@/components/dashboard/ContractHealthDashboard'
import { ContractHealthMetrics } from '@/types/contractHealth'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { fetchContractMetrics } from '@/services/contractMetrics'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/utils/dateFormat'

interface DashboardPageProps {
  verification?: {
    sourcify: boolean
    etherscan: boolean
    lastChecked: string // ISO string
  }
  security?: {
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
  deployments?: Array<{
    contractName: string
    network: string
    address: string
    deployer: string
    timestamp: string // ISO string
    txHash: string
    gasUsed: number
  }>
}

export default function DashboardPage({ 
  verification = {
    sourcify: false,
    etherscan: false,
    lastChecked: '1970-01-01T00:00:00.000Z' // Static ISO string
  },
  security = {
    vulnerabilities: 0,
    warnings: 0,
    optimizations: 0,
    score: 0,
    lastRun: '1970-01-01T00:00:00.000Z' // Static ISO string
  },
  deployments = []
}: DashboardPageProps) {
  const [contractHealthMetrics, setContractHealthMetrics] = useState<ContractHealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const contractAddress = deployments[0]?.address // Get address from first deployment

  const loadData = useCallback(async () => {
    if (!contractAddress) return
    
    try {
      setLoading(true)
      const metrics = await fetchContractMetrics(contractAddress)
      setContractHealthMetrics(metrics)
      setLastRefreshed(new Date())
      setError(null)
    } catch (err) {
      setError('Failed to load contract metrics. Click refresh to try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [contractAddress])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    loadData()
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contract Metrics</h2>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
            {lastRefreshed && (
              <span className="text-xs text-gray-500">
                Last refreshed: {formatDate(lastRefreshed.toISOString())}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
            <button 
              onClick={handleRefresh}
              className="ml-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
            >
              Retry
            </button>
          </div>
        ) : contractHealthMetrics ? (
          <Dashboard 
          verification={verification}
          security={security}
          deployments={deployments.map(d => ({
            ...d,
            gasUsed: d.gasUsed.toString(),
            timestamp: d.timestamp // Use timestamp as-is (should already be ISO string)
          }))}
          contractAnalysis={{
            size: {
              bytecode: 15000,
              deployedBytecode: 12000,
              sourceLines: 250
            },
            gasAnalysis: {
              deploymentCost: 1500000,
              methodCosts: [
                {
                  name: 'transfer',
                  cost: 21000,
                  optimization: 'Consider using batch transfers for multiple recipients'
                },
                {
                  name: 'approve',
                  cost: 45000,
                  optimization: 'Use increaseAllowance/decreaseAllowance instead'
                }
              ]
            },
            complexityScore: 45
          }}
          healthMetrics={contractHealthMetrics}
        />
        ) : null}
      </div>
    </Suspense>
  )
}
