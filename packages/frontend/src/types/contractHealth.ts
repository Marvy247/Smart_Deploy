export interface ContractSizeMetrics {
  current: number // in bytes
  limit: number // EIP-170 limit (24KB)
  recommendation?: string
}

export interface GasEfficiencyMetric {
  score: number // 0-100
  suggestions: Array<{
    type: string
    description: string
    impact: 'high' | 'medium' | 'low'
    potentialSavings?: string
  }>
}

export interface TestCoverageMetrics {
  percentage: number
  uncoveredLines: number
  criticalFunctions: Array<string>
}

export interface DeploymentCostMetrics {
  estimated: string
  historical: Array<{
    network: string
    cost: string
    date: string
  }>
}

export interface ContractAnalysisMetrics {
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

export interface ContractHealthMetrics {
  contractSize: ContractSizeMetrics
  gasEfficiency: GasEfficiencyMetric
  testCoverage: TestCoverageMetrics
  deploymentCosts: DeploymentCostMetrics
}
