import { Badge } from "@tremor/react";
import { Project } from "@/types/project";

interface CIStatusBadgeProps {
  status?: Project['status'];
  jobUrl?: string;
}

export default function CIStatusBadge({ status = 'unknown', jobUrl }: CIStatusBadgeProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'healthy':
        return 'emerald';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Badge color={getStatusColor(status)} className="mt-2">
      CI Status: {status} {jobUrl && (
        <a href={jobUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-blue-600">
          View Job
        </a>
      )}
    </Badge>
  );
}
