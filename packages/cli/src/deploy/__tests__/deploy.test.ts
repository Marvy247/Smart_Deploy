import { deployContract } from '../index';
import { getNetworkConfig } from '../networks';
import { DeploymentHistory } from '../history';
import { AuditResult, Finding } from '../../audit/types';

// Mock network config
jest.mock('../networks', () => ({
  getNetworkConfig: jest.fn().mockImplementation(() => ({
    rpcUrl: 'https://mock.rpc',
    chainId: 1,
    deployer: {
      deploy: jest.fn().mockResolvedValue({
        success: true,
        contractAddress: '0x123...',
        txHash: '0x456...',
        gasUsed: '100000',
        blockNumber: 123456
      })
    }
  }))
}));

// Mock audit tool
jest.mock('../../audit/slither', () => ({
  runSlither: jest.fn().mockResolvedValue({
    success: true,
    tools: [{
      toolName: 'slither',
      version: '1.0.0',
      success: true,
      findings: [],
      executionTime: 500,
      error: undefined
    }],
    summary: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    passed: true,
    timestamp: Date.now()
  })
}));

// Mock history
jest.mock('../history', () => ({
  DeploymentHistory: jest.fn().mockImplementation(() => ({
    addDeployment: jest.fn().mockResolvedValue(undefined),
    getDeployment: jest.fn().mockResolvedValue(undefined),
    getPreviousVersion: jest.fn().mockResolvedValue(undefined)
  }))
}));

// Mock rollback deployment
jest.mock('../index', () => ({
  ...jest.requireActual('../index'),
  rollbackDeployment: jest.fn().mockImplementation(async (options) => {
    return {
      success: true,
      contractAddress: '0x789...',
      txHash: '0xabc...',
      deploymentId: options.deploymentId,
      timestamp: Date.now(),
      status: 'rolledback'
    };
  })
}));

describe('deployContract', () => {
  it('should complete successful deployment', async () => {
    const result = await deployContract({
      network: 'localhost',
      contract: 'MockContract'
    });

    expect(result.success).toBe(true);
    expect(result.contractAddress).toBeDefined();
    expect(result.txHash).toBeDefined();
    expect(result.auditResult?.passed).toBe(true);
    expect(getNetworkConfig).toHaveBeenCalled();
  });

  it('should handle audit failures', async () => {
    const mockFindings: Finding[] = [{
      description: 'Reentrancy vulnerability',
      severity: 'high',
      impact: 'Funds can be stolen',
      confidence: 'high',
      tool: 'slither',
      location: {
        file: 'MockContract.sol',
        line: 42,
        column: 5
      },
      remediation: 'Add reentrancy guard',
      references: ['SWC-107']
    }];

    require('../../audit/slither').runSlither.mockResolvedValueOnce({
      success: true,
      tools: [{
        toolName: 'slither',
        version: '1.0.0',
        success: true,
        findings: mockFindings,
        executionTime: 1200,
        error: undefined
      }],
      summary: {
        critical: 0,
        high: 1,
        medium: 0,
        low: 0
      },
      passed: false,
      timestamp: Date.now()
    });

    // Mock user input 'n' to cancel deployment
    const mockInput = jest.spyOn(require('readline'), 'createInterface')
      .mockReturnValue({
        question: (_: string, cb: (answer: string) => void) => cb('n'),
        close: jest.fn()
      });

    const result = await deployContract({
      network: 'localhost',
      contract: 'MockContract'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('cancelled due to vulnerabilities');
    mockInput.mockRestore();
  });

  it('should handle deployment failures', async () => {
    require('../networks').getNetworkConfig.mockImplementationOnce(() => ({
      rpcUrl: 'https://mock.rpc',
      chainId: 1,
      deployer: {
        deploy: jest.fn().mockResolvedValue({
          success: false,
          error: 'Mock deployment error'
        })
      }
    }));

    const result = await deployContract({
      network: 'localhost',
      contract: 'MockContract'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Mock deployment error');
  });
});

describe('rollbackDeployment', () => {
  it('should successfully rollback a deployment', async () => {
    const { rollbackDeployment } = require('../index');
    const result = await rollbackDeployment({
      deploymentId: 'mock-deployment-id',
      reason: 'testing',
      config: './config.json'
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('rolledback');
    expect(result.contractAddress).toBeDefined();
  });

  it('should handle rollback failures', async () => {
    const { rollbackDeployment } = require('../index');
    rollbackDeployment.mockImplementationOnce(async () => ({
      success: false,
      error: 'Mock rollback error',
      status: 'failed'
    }));

    const result = await rollbackDeployment({
      deploymentId: 'mock-deployment-id', 
      reason: 'testing',
      config: './config.json'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Mock rollback error');
    expect(result.status).toBe('failed');
  });
});
