import type { AuditResult } from '../audit/types';

export interface DeployOptions {
  network: string;
  contract: string;
  config?: string;
  constructorArgs?: any[];
}

export interface Deployer {
  deploy(contract: string, config: NetworkConfig): Promise<DeploymentResult>;
}

export interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  explorerUrl?: string;
  privateKey?: string;
  verify?: boolean;
  deployer?: Deployer;
}

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  blockNumber?: number;
  deploymentId?: string;
  timestamp?: number;
  status?: 'pending' | 'success' | 'failed' | 'rolledback';
}

export interface RollbackOptions {
  deploymentId: string;
  reason?: string;
  config?: string;
}

export interface DeploymentStatus {
  deploymentId: string;
  status: 'pending' | 'success' | 'failed' | 'rolledback';
  contractAddress?: string;
  txHash?: string;
  blockNumber?: number;
  timestamp: number;
  gasUsed?: string;
}

export interface DeploymentArtifacts {
  abi: string;
  bytecode: string;
  source: string;
}

export interface DeploymentRecord extends DeploymentResult {
  contractName: string;
  network: string;
  previousDeploymentId?: string;
  artifacts: DeploymentArtifacts;
  auditResult?: AuditResult;
}
