import { expect } from 'chai';
import nock from 'nock';
import { verifyContract, checkVerificationStatus, VerificationConfig } from './verify';

describe('verifyContract', () => {
  const apiKey = 'test-api-key';
  const network = 'sepolia';
  const contractAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const sourceCode = 'contract Test {}';
  const contractName = 'Test';
  const compilerVersion = 'v0.8.17+commit.8df45f5f';
  const optimizationUsed = 1;
  const runs = 200;

  const config: VerificationConfig = {
    apiKey,
    network,
    contractAddress,
    sourceCode,
    contractName,
    compilerVersion,
    optimizationUsed,
    runs,
  };

  afterEach(() => {
    nock.cleanAll();
  });

  it('should submit verification request successfully', async () => {
    nock('https://api-sepolia.etherscan.io')
      .post('/api')
      .query(true)
      .reply(200, {
        status: '1',
        result: 'GUID12345',
      });

    const guid = await verifyContract(config);
    expect(guid).to.equal('GUID12345');
  });

  it('should throw error on verification failure', async () => {
    nock('https://api-sepolia.etherscan.io')
      .post('/api')
      .query(true)
      .reply(200, {
        status: '0',
        result: 'Verification failed',
      });

    try {
      await verifyContract(config);
      throw new Error('Expected verifyContract to throw');
    } catch (error: any) {
      expect(error.message).to.include('Verification failed');
    }
  });

  it('should check verification status successfully', async () => {
    nock('https://api-sepolia.etherscan.io')
      .get('/api')
      .query(true)
      .reply(200, {
        status: '1',
        result: 'Pass - Verified',
      });

    const status = await checkVerificationStatus(apiKey, network, 'GUID12345');
    expect(status).to.equal('Verification successful');
  });

  it('should return pending or failure message on status check', async () => {
    nock('https://api-sepolia.etherscan.io')
      .get('/api')
      .query(true)
      .reply(200, {
        status: '0',
        result: 'Pending in queue',
      });

    const status = await checkVerificationStatus(apiKey, network, 'GUID12345');
    expect(status).to.equal('Pending in queue');
  });
});
