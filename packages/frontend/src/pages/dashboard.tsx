import Dashboard from '@/components/dashboard/Dashboard'
import { DashboardSkeleton } from '@/components/dashboard/LoadingSkeleton'
import { Suspense } from 'react'

interface DashboardPageProps {
  verification?: {
    sourcify: boolean
    etherscan: boolean
    lastChecked: Date
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
    lastRun: Date
    detectorStats?: Record<string, number>
  }
  deployments?: Array<{
    contractName: string
    network: string
    address: string
    deployer: string
    timestamp: Date
    txHash: string
    gasUsed: string
  }>
}

export default function DashboardPage({ 
  verification = {
    sourcify: false,
    etherscan: false,
    lastChecked: new Date()
  },
  security = {
    vulnerabilities: 0,
    warnings: 0,
    optimizations: 0,
    score: 0,
    lastRun: new Date()
  },
  deployments = []
}: DashboardPageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard 
        verification={verification}
        security={security}
        deployments={deployments}
      />
    </Suspense>
  )
}
