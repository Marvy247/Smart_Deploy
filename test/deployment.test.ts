import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

chai.use(chaiAsPromised);
const { expect } = chai;
import { DeploymentService } from '../packages/backend/src/services/deployment';
const config = require('./deploy-config.json');

describe('Deployment Service', () => {
  const deploymentService = new DeploymentService();
  const testPrivateKey = process.env.TEST_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default to hardhat test key
  
  // Skip tests if no private key available
  if (!testPrivateKey) {
    console.warn('Skipping deployment tests - no private key provided');
    return;
  }

  it('should deploy contract successfully', async () => {
      const result = await deploymentService.deployDirect(
      {
        name: config.contractName,
        source: JSON.stringify(config.abi), // Properly stringified ABI
        bytecode: config.bytecode,
        constructorArgs: config.constructorArgs
      },
      {
        name: config.network,
        chainId: 11155111, // Sepolia
        rpcUrl: config.rpcUrl,
        explorerUrl: 'https://sepolia.etherscan.io',
        privateKey: testPrivateKey
      }

    );
    expect(result).to.have.property('transaction');
    expect(result.transaction).to.have.property('hash');
    expect(result.metrics).to.have.property('gasUsed');
  });

  it('should fail with invalid bytecode', async () => {
    await expect(deploymentService.deployDirect(
      {
        name: config.contractName,
        source: '',
        bytecode: '0xinvalid',
        constructorArgs: config.constructorArgs
      },
      {
        name: config.network,
        chainId: 11155111,
        rpcUrl: config.rpcUrl,
        explorerUrl: 'https://sepolia.etherscan.io',
        privateKey: testPrivateKey
      }
    )).to.eventually.be.rejected;
  });

  it('should fail with invalid RPC URL', async () => {
    await expect(deploymentService.deployDirect(
      {
        name: config.contractName,
        source: '',
        bytecode: config.bytecode,
        constructorArgs: config.constructorArgs
      },
      {
        name: config.network,
        chainId: 11155111,
        rpcUrl: 'https://invalid.rpc.url',
        explorerUrl: 'https://sepolia.etherscan.io',
        privateKey: testPrivateKey
      }
    )).to.eventually.be.rejected;
  });
});
