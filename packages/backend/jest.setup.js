// Add Jest extended matchers
require('@jest/globals');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.RPC_URL = 'http://localhost:8545';
process.env.ETHERSCAN_API_KEY = 'test-api-key';

// Global beforeAll and afterAll hooks
beforeAll(() => {
  // Any global setup
});

afterAll(() => {
  // Any global cleanup
});

// Add custom matchers if needed
expect.extend({
  // Add custom matchers here
});
