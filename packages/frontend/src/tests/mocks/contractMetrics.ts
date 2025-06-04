import { ContractHealthMetrics } from '@/types/contractHealth'

export const mockContractMetrics: ContractHealthMetrics = {
  contractSize: {
    current: 15000,
    limit: 24576,
    recommendation: 'Consider splitting into smaller contracts'
  },
  gasEfficiency: {
    score: 80,
    suggestions: [
      {
        type: 'storage',
        description: 'Use packed storage for small values',
        impact: 'high',
        potentialSavings: '30% gas reduction'
      }
    ]
  },
  testCoverage: {
    percentage: 85,
    uncoveredLines: 15,
    criticalFunctions: ['transfer', 'approve']
  },
  deploymentCosts: {
    estimated: '0.5 ETH',
    historical: [
      {
        network: 'mainnet',
        cost: '0.48 ETH',
        date: '2023-01-01'
      }
    ]
  }
}

export default mockContractMetrics
