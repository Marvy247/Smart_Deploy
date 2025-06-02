export enum AuditSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum VulnerabilityType {
  REENTRANCY = 'reentrancy',
  ACCESS_CONTROL = 'access-control',
  ARITHMETIC = 'arithmetic',
  UNCHECKED_LOW_LEVEL_CALLS = 'unchecked-low-level-calls',
  UNINITIALIZED_STORAGE = 'uninitialized-storage',
  FRONT_RUNNING = 'front-running',
  TIME_MANIPULATION = 'time-manipulation',
  GAS_LIMIT = 'gas-limit',
  DENIAL_OF_SERVICE = 'denial-of-service'
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  type: VulnerabilityType;
  recommendation: string;
  codeSnippet?: string;
  gasImpact?: number;
}

export interface AuditResult {
  findings: AuditFinding[];
  passed: boolean;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface AuditConfig {
  failOn: AuditSeverity[]; // Minimum severity level to fail deployment
  skip?: string[]; // IDs of findings to skip
  includeGasReport?: boolean; // Whether to include gas optimization report
  checkTypes?: VulnerabilityType[]; // Specific vulnerability types to check
  maxGasImpact?: number; // Maximum allowed gas impact
}
