export enum AuditSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  recommendation: string;
  codeSnippet?: string;
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
}
