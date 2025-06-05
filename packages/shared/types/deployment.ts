export interface UnifiedDeployment {
  id: string
  createdAt: string
  updatedAt: string
  status: 'pending' | 'deploying' | 'verifying' | 'completed' | 'failed'
  method: 'direct' | 'github' | 'api'
  network: {
    name: string
    chainId: number
    explorerUrl: string
  }
  transaction?: {
    hash: string
    blockNumber?: number
    timestamp?: number
  }
  contract: {
    name: string
    source: string
    constructorArgs?: any[]
    bytecode?: string
    abi?: any[]
    audit?: {
      status: 'pending' | 'completed' | 'failed'
      issues?: {
        severity: 'low' | 'medium' | 'high' | 'critical'
        description: string
      }[]
    }
  }
  verification?: {
    status: string
    explorerUrl?: string
  }
  metrics?: {
    gasUsed?: number
    gasPrice?: number
    executionTime?: number
  }
}
