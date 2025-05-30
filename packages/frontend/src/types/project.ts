export interface Project {
  id: string;
  name: string;
  network: string;
  contractAddress: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastDeployedAt?: string;
  transactions?: Array<{
    timestamp: string;
    value: number;
    type: string;
  }>;
  events?: Array<{
    timestamp: string;
    message: string;
    type: string;
  }>;
  ciJobUrl?: string;
  fuzzTestsPassed?: boolean;
  invariantTestsPassed?: boolean;
}
