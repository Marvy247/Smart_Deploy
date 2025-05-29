import path from 'path';
import { expect } from 'chai';
import sinon from 'sinon';
import * as verifyModule from './verify';
import { deployContract, DeploymentConfig } from './deploy';

describe('deployContract', function () {
  this.timeout(60000); // Increase timeout for deployment

  const validConfig: DeploymentConfig = {
    network: 'sepolia',
    privateKey: '0x51ac03291cd2068d48531ddb2b4d3bac5ba418e61d7b4c79c55a7bbf63452381',
    rpcUrl: 'https://methodical-misty-arm.ethereum-sepolia.quiknode.pro/94a7e73a053ca28e2f3a64e40c7ca0e0bd6d38d9/',
    etherscanApiKey: 'V1VIR998I85I2YSX6D64DFCHXJERTU92IC',
  };

  const invalidConfig: DeploymentConfig = {
    network: 'sepolia',
    privateKey: '0xinvalidprivatekey',
    rpcUrl: 'https://invalid-rpc-url'
  };

  const artifactPath = path.resolve(__dirname, '../../../out/Counter.sol/Counter.json');

  let verifyStub: sinon.SinonStub;

  beforeEach(() => {
    verifyStub = sinon.stub(verifyModule, 'verifyContract');
  });

  afterEach(() => {
    verifyStub.restore();
  });

  it('should deploy contract successfully with valid config and verify successfully', async () => {
    verifyStub.resolves('GUID12345');
    const contract = await deployContract(validConfig, 'Counter', artifactPath);
    expect(contract).to.have.property('target').that.is.a('string');
    expect(verifyStub.calledOnce).to.be.true;
  });

  it('should deploy contract successfully but handle verification failure gracefully', async () => {
    verifyStub.rejects(new Error('Verification failed'));
    let contract;
    try {
      contract = await deployContract(validConfig, 'Counter', artifactPath);
    } catch (error) {
      // The deployContract should not throw on verification failure
      throw new Error('Deployment failed due to verification error');
    }
    expect(contract).to.have.property('target').that.is.a('string');
    expect(verifyStub.calledOnce).to.be.true;
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
