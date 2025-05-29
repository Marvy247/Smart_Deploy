import api from './api';

export interface ContractHealth {
  status: string;
  uptime: number;
  lastUpdate: string;
}

export interface Transaction {
  date: string;
  count: number;
  gasUsed: number;
}

export interface Event {
  timestamp: string;
  type: string;
  details: string;
}

export interface Log {
  timestamp: string;
  level: string;
  message: string;
}

export interface MetricsData {
  health: ContractHealth;
  transactions: { daily: Transaction[] };
  events: Event[];
  logs: Log[];
}

export const metricsService = {
  async getMetrics(): Promise<MetricsData> {
    const [health, transactions, events, logs] = await Promise.all([
      this.getHealth(),
      this.getTransactions(),
      this.getEvents(),
      this.getLogs()
    ]);
    return { health, transactions, events, logs };
  },

  async getHealth(): Promise<ContractHealth> {
    const response = await api.get('/api/metrics/health');
    return response.data;
  },

  async getTransactions(): Promise<{ daily: Transaction[] }> {
    const response = await api.get('/api/metrics/transactions');
    return response.data;
  },

  async getEvents(): Promise<Event[]> {
    const response = await api.get('/api/metrics/events');
    return response.data;
  },

  async getLogs(): Promise<Log[]> {
    const response = await api.get('/api/metrics/logs');
    return response.data;
  }
};
