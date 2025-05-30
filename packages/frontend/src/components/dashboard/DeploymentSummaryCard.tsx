import { Card, Text, Metric, Button } from "@tremor/react";
import { format } from "date-fns";
import Link from "next/link";

interface DeploymentSummaryCardProps {
  deploymentCount: number;
  lastDeployedAt?: string;
}

export default function DeploymentSummaryCard({ deploymentCount, lastDeployedAt }: DeploymentSummaryCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col justify-between">
      <div>
        <Text>Deployments</Text>
        <Metric className="mt-1">{deploymentCount}</Metric>
        <Text className="mt-2 text-sm text-gray-500">
          {lastDeployedAt ? format(new Date(lastDeployedAt), 'MMM d, yyyy') : 'No deployments yet'}
        </Text>
      </div>
      <div className="mt-4">
        <Link href="/deployments" passHref legacyBehavior>
          <Button size="sm" variant="light" className="w-full">
            View All Deployments
          </Button>
        </Link>
      </div>
    </Card>
  );
}
