export const mockVerificationData = {
  sourcify: true,
  etherscan: true,
  lastChecked: new Date('2023-11-15T14:30:00')
}

export const mockSecurityData = {
  vulnerabilities: {
    high: 1,
    medium: 1,
    low: 0,
    informational: 0,
    total: 2
  },
  warnings: 5,
  optimizations: 3,
  score: 7,
  reportUrl: 'https://slither.report/12345',
  lastRun: new Date('2023-11-15T14:25:00'),
  detectorStats: {
    'reentrancy': 1,
    'unchecked-low-level-calls': 1
  }
}

// Legacy format example (for backward compatibility)
export const mockSecurityDataLegacy = {
  vulnerabilities: 2,
  warnings: 5,
  optimizations: 3,
  score: 7,
  reportUrl: 'https://slither.report/12345',
  lastRun: new Date('2023-11-15T14:25:00')
}

export const mockDashboardData = {
  verification: mockVerificationData,
  security: mockSecurityData
}

export const mockDashboardDataLegacy = {
  verification: mockVerificationData,
  security: mockSecurityDataLegacy
}
