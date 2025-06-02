import { deployContract, rollbackDeployment } from '../index';
import { JsonRpcProvider } from 'ethers';
import { tmpdir } from 'os';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Anvil default configuration
const ANVIL_RPC = 'http://localhost:8545';
const TEST_CONFIG = join(tmpdir(), 'test-config.json');

// Write test config using Anvil's first account
writeFileSync(TEST_CONFIG, JSON.stringify({
  networks: {
    anvil: {
      rpcUrl: ANVIL_RPC,
      chainId: 31337,
      deployer: {
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' // Anvil account 0
      }
    }
  }
}));

describe('Anvil Integration Tests', () => {
  let provider: JsonRpcProvider;
  let testContractAddress: string;
  let deploymentId: string;

  beforeAll(async () => {
    provider = new JsonRpcProvider(ANVIL_RPC);
    // Verify Anvil is running
    try {
      await provider.getBlockNumber();
    } catch (e) {
      throw new Error('Anvil not running. Please start with `anvil` command');
    }
  });

  it('should deploy contract to Anvil', async () => {
    const result = await deployContract({
      network: 'anvil',
      contract: 'test/TestContract.sol',
      constructorArgs: ['42'], // Initial value as string
      config: TEST_CONFIG
    });

    expect(result.success).toBe(true);
    expect(result.contractAddress).toBeDefined();
    expect(result.txHash).toBeDefined();

    testContractAddress = result.contractAddress!;
    deploymentId = result.deploymentId!;
  });

  it('should verify deployed contract', async () => {
    const code = await provider.getCode(testContractAddress);
    expect(code).not.toBe('0x');
  });

  it('should rollback deployment', async () => {
    const result = await rollbackDeployment({
      deploymentId,
      reason: 'integration test',
      config: TEST_CONFIG
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('rolledback');
  });

  it('should verify rollback', async () => {
    const code = await provider.getCode(testContractAddress);
    expect(code).toBe('0x');
  });

  // Additional test cases
  it('should handle deployment failures', async () => {
    const result = await deployContract({
      network: 'anvil',
      contract: 'test/InvalidContract.sol', // Non-existent contract
      config: TEST_CONFIG
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
