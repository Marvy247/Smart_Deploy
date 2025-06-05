import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';
import type { JsonRpcProvider } from 'ethers';
import type { UnifiedDeployment } from '../packages/shared/types/deployment';

chai.use(chaiAsPromised);
const { expect } = chai;
import { DeploymentService } from '../packages/backend/src/services/deployment';
const config = require('./deploy-config.json');

// Anvil default account details
const ANVIL_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const ANVIL_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const ANVIL_RPC = 'http://localhost:8545';

describe('Anvil Deployment Tests', () => {
  const deploymentService = new DeploymentService();
  const provider = new ethers.JsonRpcProvider(ANVIL_RPC) as JsonRpcProvider;

  before(async () => {
    // Verify Anvil is running and account has ETH
    await provider.getBlockNumber().catch(() => {
      throw new Error('Anvil not running - please start Anvil first');
    });
    
    const balance = await provider.getBalance(ANVIL_ADDRESS);
    if (balance === 0n) { // Using native BigInt comparison
      throw new Error('Anvil account has no ETH');
    }
  });

  it('should deploy contract successfully to Anvil', async () => {
    const result = await deploymentService.deployDirect(
      {
        name: config.contractName,
        source: JSON.stringify(config.abi),
        bytecode: config.bytecode,
        constructorArgs: config.constructorArgs
      },
      {
        name: 'anvil',
        chainId: 31337, // Anvil chainId
        rpcUrl: ANVIL_RPC,
        explorerUrl: '',
        privateKey: ANVIL_PRIVATE_KEY
      }
    ) as UnifiedDeployment;

    expect(result).to.have.property('transaction');
    expect(result.transaction).to.have.property('hash');
    expect(result).to.have.property('metrics');
    expect(result.metrics?.gasUsed).to.be.greaterThan(0);
  });

  it('should fail with invalid bytecode on Anvil', async () => {
    await expect(deploymentService.deployDirect(
      {
        name: config.contractName,
        source: '',
        bytecode: '0xinvalid',
        constructorArgs: config.constructorArgs
      },
      {
        name: 'anvil',
        chainId: 31337,
        rpcUrl: ANVIL_RPC,
        explorerUrl: '',
        privateKey: ANVIL_PRIVATE_KEY
      }
    )).to.eventually.be.rejectedWith('invalid bytecode');
  });

  it('should track deployment status correctly', async () => {
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
        rpcUrl: ANVIL_RPC,
        explorerUrl: '',
        privateKey: ANVIL_PRIVATE_KEY
      }
    ) as UnifiedDeployment;

    expect(result.status).to.equal('completed');
    expect(result.transaction).to.have.property('blockNumber');
  });

  it('should verify contract deployment on Anvil', async () => {
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
        rpcUrl: ANVIL_RPC,
        explorerUrl: '',
        privateKey: ANVIL_PRIVATE_KEY
      }
    ) as UnifiedDeployment & { contractAddress: string };

    const code = await provider.getCode(result.contractAddress);
    expect(code).to.not.equal('0x');
  });
});
