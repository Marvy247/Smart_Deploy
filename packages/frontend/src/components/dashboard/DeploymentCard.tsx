import { Card, Text, Metric, Badge } from "@tremor/react";
import { format } from "date-fns";
import { Project } from "@/types/project";

interface DeploymentCardProps {
  project: Project;
}

function VerificationStatusBadge({ verified }: { verified: boolean }) {
  return (
    <Badge color={verified ? "emerald" : "red"}>
      {verified ? "Verified" : "Unverified"}
    </Badge>
  );
}

export default function DeploymentCard({ project }: DeploymentCardProps) {
  // For demo, assume verification status is part of project, default to false
  const isVerified = (project as any).verified ?? false;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <Text>{project.network}</Text>
          <Metric className="mt-1">{project.name}</Metric>
          <Text className="mt-2 text-sm text-gray-500">
            {project.contractAddress}
          </Text>
          <div className="mt-2">
            <VerificationStatusBadge verified={isVerified} />
          </div>
        </div>
        <Badge color="emerald" className="self-start">
          {project.lastDeployedAt ? 
            format(new Date(project.lastDeployedAt), 'MMM d') : 
            'Not deployed'}
        </Badge>
      </div>
    </Card>
  );
}
