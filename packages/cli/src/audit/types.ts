export interface Finding {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact?: string;
  confidence?: 'low' | 'medium' | 'high';
  tool?: 'slither' | 'mythx' | 'other';
  location?: {
    file: string;
    line?: number;
    column?: number;
  };
  remediation?: string;
  references?: string[];
}

export interface ToolResult {
  toolName: string;
  version?: string;
  success: boolean;
  error?: string;
  executionTime?: number;
  findings: Finding[];
}

export interface AuditResult {
  success: boolean;
  error?: string;
  tools: ToolResult[];
  summary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  passed?: boolean;
  timestamp?: number;
}
