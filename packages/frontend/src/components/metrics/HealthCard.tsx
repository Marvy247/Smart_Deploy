import { Card, Text, Metric, Badge } from "@tremor/react";
import { format } from "date-fns";
import { ContractHealth } from "../../services/metrics";

interface HealthCardProps {
  health: ContractHealth;
}

export default function HealthCard({ health }: HealthCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Card className="max-w-xs mx-auto">
      <Text>Contract Health</Text>
      <Metric>{health.status}</Metric>
      <div className="mt-4">
        <Badge color={getStatusColor(health.status)}>
          {health.uptime}% Uptime
        </Badge>
      </div>
      <Text className="mt-2 text-sm text-gray-500">
        Last Updated: {format(new Date(health.lastUpdate), 'PPp')}
      </Text>
    </Card>
  );
}
