import { useState, useEffect } from 'react';
import HealthCard from '../components/metrics/HealthCard';
import TransactionChart from '../components/metrics/TransactionChart';
import EventsTimeline from '../components/metrics/EventsTimeline';
import LogsTable from '../components/metrics/LogsTable';
import { metricsService } from '../services/metrics';

interface MetricsData {
  health: {
    status: string;
    uptime: number;
    lastUpdate: string;
  };
  transactions: {
    daily: {
      date: string;
      count: number;
      gasUsed: number;
    }[];
  };
  events: {
    timestamp: string;
    type: string;
    details: string;
  }[];
  logs: {
    timestamp: string;
    level: string;
    message: string;
  }[];
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await metricsService.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="text-center py-8">Loading metrics...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!metrics) return <div className="text-center py-8">No metrics data available</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Metrics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <HealthCard health={metrics.health} />
        <TransactionChart transactions={metrics.transactions.daily} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <EventsTimeline events={metrics.events} />
        <LogsTable logs={metrics.logs} />
      </div>
    </div>
  );
}
