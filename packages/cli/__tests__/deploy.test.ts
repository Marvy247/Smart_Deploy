import { deployContract } from '../src/deploy';
import { DeployOptions } from '../src/deploy/types';
import { runSlither } from '@audit/slither';
import { getNetworkConfig } from '../src/deploy/networks';

// Mock all dependencies
jest.mock('@audit/slither');
jest.mock('@audit/types');
jest.mock('../src/deploy/networks');

// Mock readline
const mockQuestion = jest.fn((question, callback) => {
  process.nextTick(() => callback('n')); // Default to 'n' response
});
const mockClose = jest.fn();

jest.mock('readline', () => ({
  createInterface: jest.fn().mockImplementation(() => ({
    question: mockQuestion,
    close: mockClose
  }))
}));

// Helper to override default response
function setMockResponse(answer: string) {
  mockQuestion.mockImplementationOnce((_, cb) => {
    process.nextTick(() => cb(answer));
  });
}

// Mock console methods for cleaner test output
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
global.console = mockConsole as any;

describe('deployContract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock audit results
    (runSlither as jest.Mock).mockImplementation((contractPath: string) => ({
      success: !contractPath.includes('vulnerable'),
      findings: contractPath.includes('vulnerable') 
        ? [{ description: 'Reentrancy vulnerability' }] 
        : []
    }));

    // Mock network config
    (getNetworkConfig as jest.Mock).mockImplementation((network, config) => ({
      rpcUrl: config ? JSON.parse(config).rpcUrl : `https://${network}.rpc`,
      chainId: 1,
      explorerUrl: `https://${network}.explorer`
    }));
  });

  it('should cancel deployment when vulnerabilities found and user declines', async () => {
    const result = await deployContract({
      network: 'testnet',
      contract: 'vulnerable-contract'
    });

    expect(mockQuestion).toHaveBeenCalledWith(
      'Continue with deployment despite vulnerabilities? (y/N) ',
      expect.any(Function)
    );
    expect(mockClose).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Vulnerabilities found:');
    expect(console.log).toHaveBeenCalledWith('Deployment cancelled');
    expect(result).toEqual({
      success: false,
      error: 'Deployment cancelled due to vulnerabilities'
    });
  });

  it('should proceed with deployment when audit passes', async () => {
    const result = await deployContract({
      network: 'testnet',
      contract: 'safe-contract'
    });

    expect(result.success).toBe(true);
    expect(console.log).toHaveBeenCalledWith('Deployment completed successfully');
  });

  it('should proceed when vulnerabilities found but user confirms', async () => {
    setMockResponse('y');
    const result = await deployContract({
      network: 'testnet',
      contract: 'vulnerable-contract'
    });

    expect(result.success).toBe(true);
    expect(console.log).toHaveBeenCalledWith('Deployment completed successfully');
  });
});
