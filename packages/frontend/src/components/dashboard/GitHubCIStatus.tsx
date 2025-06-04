import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface GitHubCIProps {
  status: 'success' | 'failure' | 'pending'
  branch: string
  lastCommit: {
    hash: string
    message: string
    timestamp: Date
  }
  workflowName: string
  workflowUrl?: string
}

export default function GitHubCIStatus({
  status,
  branch,
  lastCommit,
  workflowName,
  workflowUrl
}: GitHubCIProps) {
  const statusConfig = {
    success: {
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      text: 'Passing'
    },
    failure: {
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      text: 'Failed'
    },
    pending: {
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      text: 'Running'
    }
  }

  const { icon: Icon, color, bgColor, text } = statusConfig[status]

  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={`h-6 w-6 ${color}`} />
            <div>
              <h3 className={`text-sm font-medium ${color}`}>
                {workflowName}: {text}
              </h3>
              <p className="text-sm text-gray-500">
                Branch: {branch}
              </p>
            </div>
          </div>
          {workflowUrl && (
            <a
              href={workflowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View workflow →
            </a>
          )}
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              <span className="font-medium">Last commit:</span>{' '}
              {lastCommit.hash.substring(0, 7)}
            </div>
            <div>{lastCommit.timestamp.toLocaleString()}</div>
          </div>
          <p className="mt-1 text-sm text-gray-600 truncate">
            {lastCommit.message}
          </p>
        </div>
      </div>
    </div>
  )
}
