import axios from 'axios'
import { ethers } from 'ethers'
import { UnifiedDeployment } from '@shared/types/deployment'
import { analyzeContract } from '../audit/contractAnalysis'
import { AuditSeverity } from '../audit/types'

export class DeploymentService {
  private etherscanBaseUrls: Record<number, string> = {
    1: 'https://api.etherscan.io/api',
    5: 'https://api-goerli.etherscan.io/api', 
    11155111: 'https://api-sepolia.etherscan.io/api',
    31337: 'http://localhost:8545' // Anvil local network
  }

  async createDeployment(deployment: Omit<UnifiedDeployment, 'id'|'createdAt'|'updatedAt'|'status'>): Promise<UnifiedDeployment> {
    const newDeployment: UnifiedDeployment = {
      ...deployment,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    }

    // Perform security audit
    if (deployment.contract.source) {
      const analysis = await analyzeContract(deployment.contract.source)
      newDeployment.contract.audit = {
        status: 'completed',
        issues: analysis.findings
          .filter(f => f.severity !== AuditSeverity.INFO) // Exclude info level findings
          .map(f => ({
            severity: f.severity as 'low' | 'medium' | 'high' | 'critical',
            description: f.description
          }))
      }
    }

    return newDeployment
  }

  async verifyWithEtherscan(
    deployment: UnifiedDeployment,
    apiKey: string
  ): Promise<UnifiedDeployment> {
    if (!deployment.transaction?.hash || !deployment.contract.bytecode) {
      throw new Error('Missing required verification data')
    }

    const baseUrl = this.etherscanBaseUrls[deployment.network.chainId]
    if (!baseUrl) {
      throw new Error(`Unsupported network for Etherscan: ${deployment.network.chainId}`)
    }

    const updatedDeployment: UnifiedDeployment = {
      ...deployment,
      status: 'verifying',
      updatedAt: new Date().toISOString(),
      verification: {
        status: 'pending'
      }
    }

    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: deployment.transaction.hash,
        sourceCode: deployment.contract.source,
        codeformat: 'solidity-single-file',
        contractname: deployment.contract.name,
        compilerversion: 'v0.8.17+commit.8df45f5f',
        optimizationUsed: '0',
        runs: '200',
        ...(deployment.contract.constructorArgs && {
          constructorArguements: JSON.stringify(deployment.contract.constructorArgs)
        })
      })

      const response = await axios.post(baseUrl, params)
      
      if (response.data.status === '1') {
        updatedDeployment.verification = {
          status: 'verified',
          explorerUrl: `${deployment.network.explorerUrl}/address/${deployment.transaction.hash}#code`
        }
      } else {
        throw new Error(response.data.result || 'Verification failed')
      }
    } catch (error) {
      updatedDeployment.verification = {
        status: 'failed',
        explorerUrl: deployment.network.explorerUrl
      }
      throw error
    }

    return updatedDeployment
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  async deployDirect(
    contract: {
      name: string;
      source: string;
      bytecode: string;
      constructorArgs?: any[];
    },
    network: {
      name: string;
      chainId: number;
      rpcUrl: string;
      explorerUrl: string;
      privateKey?: string;
    }
  ): Promise<UnifiedDeployment> {
    const deployment = await this.createDeployment({
      method: 'direct',
      contract,
      network
    });

    try {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      const signer = new ethers.Wallet(network.privateKey || process.env.DEPLOYER_PRIVATE_KEY!, provider);
      
      const factory = new ethers.ContractFactory(
        contract.source,
        contract.bytecode,
        signer
      );

      const contractInstance = await factory.deploy(...(contract.constructorArgs || []));
      const txReceipt = await contractInstance.deploymentTransaction()?.wait();

      if (!txReceipt) {
        throw new Error('Transaction receipt not available');
      }

      deployment.transaction = {
        hash: txReceipt.hash,
        blockNumber: txReceipt.blockNumber
      };
      deployment.metrics = {
        gasUsed: Number(txReceipt.gasUsed),
        gasPrice: Number(txReceipt.gasPrice)
      };

      deployment.status = 'completed';
      deployment.updatedAt = new Date().toISOString();
      
      // Skip verification for local networks (chainId 31337)
      if (network.chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
        await this.verifyWithEtherscan(deployment, process.env.ETHERSCAN_API_KEY);
      } else {
        deployment.verification = {
          status: 'skipped',
          explorerUrl: network.explorerUrl
        };
      }
      
      return deployment;
    } catch (error) {
      deployment.status = 'failed';
      deployment.updatedAt = new Date().toISOString();
      throw error;
    }
  }
}
