/**
 * Unified deployment interface for all deployment methods
 */
export interface UnifiedDeployment {
  id: string
  method: 'direct' | 'github' | 'api'
  status: 'pending' | 'deploying' | 'verifying' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  
  // Contract details
  contract: {
    name: string
    source: string  
    constructorArgs?: any[]
    bytecode?: string
    abi?: any[]
    // Security audit results
    audit?: {
      status: 'pending' | 'completed' | 'failed'
      issues?: {
        severity: 'low' | 'medium' | 'high' | 'critical'
        description: string
      }[]
    }
  }

  // Network configuration
  network: {
    name: string
    chainId: number
    rpcUrl: string
    explorerUrl?: string
    // Verification provider configuration
    verification?: {
      etherscanApiKey?: string
      sourcifyEnabled?: boolean
    }
  }

  // Transaction details
  transaction?: {
    hash: string
    gasUsed: string
    gasPrice: string
    blockNumber: number
  }

  // Verification status
  verification?: {
    status: 'pending' | 'verified' | 'failed'
    explorerUrl?: string
  }

  // GitHub deployment fields (only for github method)
  githubRepo?: string
  githubWorkflow?: string
  githubRunId?: string
  githubStatus?: 'pending' | 'in_progress' | 'completed' | 'failed'
  githubCommit?: string

  // Deployment metrics
  metrics?: {
    deploymentTimeMs?: number
    gasUsed?: number
    gasPrice?: string
    totalCost?: string
  }
}
