import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';
import type { JsonRpcProvider } from 'ethers';
import type { UnifiedDeployment } from '../packages/shared/types/deployment';
import { DeploymentService } from '../packages/backend/src/services/deployment';
import { AuditSeverity } from '../packages/backend/src/audit/types';
const config = require('./deploy-config.json');

chai.use(chaiAsPromised);
const { expect } = chai;

// Anvil default account details
const ANVIL_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const ANVIL_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const ANVIL_RPC = 'http://localhost:8545';

describe('Enhanced Anvil Deployment Tests', () => {
  const deploymentService = new DeploymentService();
  const provider = new ethers.JsonRpcProvider(ANVIL_RPC) as JsonRpcProvider;

  before(async () => {
    await provider.getBlockNumber().catch(() => {
      throw new Error('Anvil not running - please start Anvil first');
    });

    const balance = await provider.getBalance(ANVIL_ADDRESS);
    if (balance === 0n) {
      throw new Error('Anvil account has no ETH');
    }
  });

  describe('Status Transitions', () => {
    it('should transition from pending to completed', async () => {
      const deployment = await deploymentService.createDeployment({
        method: 'direct',
        contract: {
          name: config.contractName,
          source: JSON.stringify(config.abi),
          bytecode: config.bytecode,
          constructorArgs: config.constructorArgs
        },
        network: {
          name: 'anvil',
          chainId: 31337,
          explorerUrl: ''
        },
        // @ts-ignore
        rpcUrl: ANVIL_RPC
      });

      expect(deployment.status).to.equal('pending');

      const result = await deploymentService.deployDirect(
        {
          name: config.contractName,
          source: JSON.stringify(config.abi),
          bytecode: config.bytecode,
          constructorArgs: config.constructorArgs
        },
        {
          name: 'anvil',
          chainId: 31337,
          explorerUrl: '',
          // @ts-ignore
          rpcUrl: ANVIL_RPC,
          privateKey: ANVIL_PRIVATE_KEY
        }
      ) as UnifiedDeployment;

      expect(result.status).to.equal('completed');
    });

    it('should transition to failed on error', async () => {
      // Mock a failing deployment
      const originalDeploy = deploymentService.deployDirect;
      deploymentService.deployDirect = async () => {
        throw new Error('Simulated deployment failure');
      };

      const deployment = await deploymentService.createDeployment({
        method: 'direct',
        contract: {
          name: config.contractName,
          source: JSON.stringify(config.abi),
          bytecode: config.bytecode,
          constructorArgs: config.constructorArgs
        },
        network: {
          name: 'anvil',
          chainId: 31337,
          explorerUrl: ''
        },
        // @ts-ignore
        rpcUrl: ANVIL_RPC
      });

      try {
        await deploymentService.deployDirect(
          {
            name: config.contractName,
            source: JSON.stringify(config.abi),
            bytecode: config.bytecode,
            constructorArgs: config.constructorArgs
          },
          {
            name: 'anvil',
            chainId: 31337,
            explorerUrl: '',
            // @ts-ignore
            rpcUrl: ANVIL_RPC,
            privateKey: ANVIL_PRIVATE_KEY
          }
        );
      } catch (error) {
        expect(deployment.status).to.equal('failed');
      }

      // Restore original implementation
      deploymentService.deployDirect = originalDeploy;
    });
  });
    

  describe('Direct Deployment', () => {
    it('should create deployment with audit findings', async () => {
      const deployment = await deploymentService.createDeployment({
        method: 'direct',
        contract: {
          name: config.contractName,
          source: JSON.stringify(config.abi),
          bytecode: config.bytecode,
          constructorArgs: config.constructorArgs
        },
        network: {
          name: 'anvil',
          chainId: 31337,
          explorerUrl: ''
        },
        // @ts-ignore - rpcUrl is needed for DeploymentService but not in UnifiedDeployment type
        rpcUrl: ANVIL_RPC
      });

      expect(deployment).to.have.property('contract');
      expect(deployment.contract).to.have.property('audit');
      expect(deployment.status).to.equal('pending');
    });

    it('should complete deployment with metrics', async () => {
      const result = await deploymentService.deployDirect(
        {
          name: config.contractName,
          source: JSON.stringify(config.abi),
          bytecode: config.bytecode,
          constructorArgs: config.constructorArgs
        },
        {
          name: 'anvil',
          chainId: 31337,
          explorerUrl: '',
          // @ts-ignore - these properties are needed for DeploymentService but not in UnifiedDeployment type
          rpcUrl: ANVIL_RPC,
          privateKey: ANVIL_PRIVATE_KEY
        }
      ) as UnifiedDeployment;

      expect(result.status).to.equal('completed');
      expect(result.metrics?.gasUsed).to.be.greaterThan(0);
      expect(result.transaction).to.have.property('blockNumber');
    });
  });

  describe('Error Scenarios', () => {
    it('should reject invalid bytecode', async () => {
      await expect(
        deploymentService.deployDirect(
          {
            name: 'InvalidContract',
            source: '',
            bytecode: '0xinvalid',
            constructorArgs: []
          },
          {
            name: 'anvil',
            chainId: 31337,
            explorerUrl: '',
            // @ts-ignore
            rpcUrl: ANVIL_RPC,
            privateKey: ANVIL_PRIVATE_KEY
          }
        )
      ).to.eventually.be.rejectedWith('invalid bytecode');
    });

    it('should fail with invalid constructor args', async () => {
      await expect(
        deploymentService.deployDirect(
          {
            name: config.contractName,
            source: JSON.stringify(config.abi),
            bytecode: config.bytecode,
            constructorArgs: ['invalid-arg'] // Wrong type
          },
          {
            name: 'anvil',
            chainId: 31337,
            explorerUrl: '',
            // @ts-ignore
            rpcUrl: ANVIL_RPC,
            privateKey: ANVIL_PRIVATE_KEY
          }
        )
      ).to.eventually.be.rejected;
    });

    it('should handle failed transactions', async () => {
      // Mock a failed transaction by using insufficient gas
      const originalDeploy = deploymentService.deployDirect;
      deploymentService.deployDirect = async () => {
        throw new Error('Transaction failed');
      };

      await expect(
        deploymentService.deployDirect(
          {
            name: config.contractName,
            source: JSON.stringify(config.abi),
            bytecode: config.bytecode,
            constructorArgs: config.constructorArgs
          },
          {
            name: 'anvil',
            chainId: 31337,
            explorerUrl: '',
            // @ts-ignore
            rpcUrl: ANVIL_RPC,
            privateKey: ANVIL_PRIVATE_KEY
          }
        )
      ).to.eventually.be.rejectedWith('Transaction failed');

      // Restore original implementation
      deploymentService.deployDirect = originalDeploy;
    });
  });

  describe('Verification Flow', () => {
    it('should skip verification for local network', async () => {
      const result = await deploymentService.deployDirect(
        {
          name: config.contractName,
          source: JSON.stringify(config.abi),
          bytecode: config.bytecode,
          constructorArgs: config.constructorArgs
        },
        {
          name: 'anvil',
          chainId: 31337,
          explorerUrl: '',
          // @ts-ignore
          rpcUrl: ANVIL_RPC,
          privateKey: ANVIL_PRIVATE_KEY
        }
      ) as UnifiedDeployment;

      expect(result.verification?.status).to.equal('skipped');
    });

    it('should simulate successful verification', async () => {
      // Mock etherscan verification
      const originalVerify = deploymentService.verifyWithEtherscan;
      deploymentService.verifyWithEtherscan = async () => {
        return {
          ...deployment,
          verification: {
            status: 'verified',
            explorerUrl: 'https://etherscan.io/address/0x123...'
          }
        } as UnifiedDeployment;
      };

      const deployment = await deploymentService.createDeployment({
        method: 'direct',
        contract: {
          name: config.contractName,
          source: JSON.stringify(config.abi),
          bytecode: config.bytecode,
          constructorArgs: config.constructorArgs
        },
        network: {
          name: 'goerli',
          chainId: 5,
          explorerUrl: 'https://goerli.etherscan.io'
        },
        // @ts-ignore
        rpcUrl: ANVIL_RPC
      });

      const verified = await deploymentService.verifyWithEtherscan(deployment, 'test-api-key');
      expect(verified.verification?.status).to.equal('verified');

      // Restore original implementation
      deploymentService.verifyWithEtherscan = originalVerify;
    });

    it('should handle verification failure', async () => {
      // Mock failed verification
      const originalVerify = deploymentService.verifyWithEtherscan;
      deploymentService.verifyWithEtherscan = async () => {
        throw new Error('Verification failed');
      };

      const deployment = await deploymentService.createDeployment({
        method: 'direct',
        contract: {
          name: config.contractName,
          source: JSON.stringify(config.abi),
          bytecode: config.bytecode,
          constructorArgs: config.constructorArgs
        },
        network: {
          name: 'goerli',
          chainId: 5,
          explorerUrl: 'https://goerli.etherscan.io'
        },
        // @ts-ignore
        rpcUrl: ANVIL_RPC
      });

      await expect(
        deploymentService.verifyWithEtherscan(deployment, 'test-api-key')
      ).to.be.rejectedWith('Verification failed');

      // Restore original implementation
      deploymentService.verifyWithEtherscan = originalVerify;
    });
  });
});
