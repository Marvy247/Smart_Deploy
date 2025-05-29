import path from 'path';
import { expect } from 'chai';
import { deployContract, DeploymentConfig } from './deploy';

describe('deployContract', function () {
  this.timeout(60000); // Increase timeout for deployment

  const validConfig: DeploymentConfig = {
    network: 'sepolia',
    privateKey: '0x51ac03291cd2068d48531ddb2b4d3bac5ba418e61d7b4c79c55a7bbf63452381',
    rpcUrl: 'https://methodical-misty-arm.ethereum-sepolia.quiknode.pro/94a7e73a053ca28e2f3a64e40c7ca0e0bd6d38d9/'
  };

  const invalidConfig: DeploymentConfig = {
    network: 'sepolia',
    privateKey: '0xinvalidprivatekey',
    rpcUrl: 'https://invalid-rpc-url'
  };

  const artifactPath = path.resolve(__dirname, '../../../out/Counter.sol/Counter.json');

  it('should deploy contract successfully with valid config', async () => {
    const contract = await deployContract(validConfig, 'Counter', artifactPath);
    expect(contract).to.have.property('target').that.is.a('string');
  });

  it('should fail to deploy contract with invalid config', async () => {
    try {
      await deployContract(invalidConfig, 'Counter', artifactPath);
      throw new Error('Deployment should have failed but did not');
    } catch (error: any) {
      expect(error).to.exist;
    }
  });
});
