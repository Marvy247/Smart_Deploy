export interface Deployment {
  contractName: string
  network: string
  address: string
  deployer: string
  timestamp: string // ISO string
  txHash: string
  gasUsed: string | number
  // GitHub deployment fields
  githubRepo?: string
  githubWorkflow?: string
  githubRunId?: string
  githubStatus?: 'pending' | 'in_progress' | 'completed' | 'failed'
  githubCommit?: string
}
