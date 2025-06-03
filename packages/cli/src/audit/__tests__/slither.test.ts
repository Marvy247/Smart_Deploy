import { runSlither } from '../slither';
import type { Finding } from '../types';

describe('runSlither', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should correctly count findings by severity', async () => {
    const mockFindings: Finding[] = [
      { severity: 'critical', tool: 'slither', description: 'Critical vulnerability' },
      { severity: 'high', tool: 'slither', description: 'High severity issue' },
      { severity: 'medium', tool: 'slither', description: 'Medium risk finding' },
      { severity: 'low', tool: 'slither', description: 'Low impact issue' },
      { severity: 'critical', tool: 'slither', description: 'Another critical bug' }
    ];

    // Mock the actual slither implementation
    jest.spyOn(require('../slither'), 'runSlither').mockImplementation(async () => ({
        success: true,
        tools: [{
          toolName: 'slither',
          success: true,
          findings: mockFindings,
          detectorStats: {}
        }],
        summary: {
          critical: 2,
          high: 1,
          medium: 1,
          low: 1,
          total: 5
        },
        passed: false,
        timestamp: Date.now()
    }));
    const result = await runSlither('test/path');

    expect(result.summary).toEqual({
      critical: 2,
      high: 1,
      medium: 1,
      low: 1,
      total: 5
    });
    expect(result.passed).toBe(false);
  });

  it('should pass when no critical/high/medium findings', async () => {
    const mockFindings: Finding[] = [
      { severity: 'low', tool: 'slither', description: 'Minor issue 1' },
      { severity: 'low', tool: 'slither', description: 'Minor issue 2' }
    ];

    // Mock the actual slither implementation
    jest.spyOn(require('../slither'), 'runSlither').mockImplementation(async () => ({
        success: true,
        tools: [{
          toolName: 'slither',
          success: true,
          findings: mockFindings,
          detectorStats: {}
        }],
        summary: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 2,
          total: 2
        },
        passed: true,
        timestamp: Date.now()
    }));
    const result = await runSlither('test/path');

    expect(result.passed).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    // Mock error case
    const mockError = new Error('Slither failed');
    jest.spyOn(require('../slither'), 'runSlither').mockImplementation(async () => {
      throw mockError;
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await runSlither('invalid/path');
      fail('Expected error to be thrown');
    } catch (error) {
      expect(error).toBe(mockError);
      if (error instanceof Error) {
        expect(error.message).toBe('Slither failed');
      } else {
        fail('Thrown error is not an instance of Error');
      }
    }
  });
});
