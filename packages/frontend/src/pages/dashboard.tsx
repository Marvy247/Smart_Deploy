import Dashboard from '@/components/dashboard/Dashboard'
import { DashboardSkeleton } from '@/components/dashboard/LoadingSkeleton'
import { Suspense } from 'react'

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
    lastChecked: new Date(0).toISOString() // ISO string
  },
  security = {
    vulnerabilities: 0,
    warnings: 0,
    optimizations: 0,
    score: 0,
    lastRun: new Date(0).toISOString() // ISO string
  },
  deployments = []
}: DashboardPageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard 
        verification={verification}
        security={security}
          deployments={deployments.map(d => ({
            ...d,
            gasUsed: d.gasUsed.toString(),
            timestamp: new Date(d.timestamp).toISOString() // Convert to ISO string
          }))}

      />
    </Suspense>
  )
}
