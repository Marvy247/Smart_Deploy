import { Spinner } from '../common/Spinner'

interface DeploymentProgressProps {
  status: string
  isLoading: boolean
  error?: boolean
}

export const DeploymentProgress = ({ status, isLoading }: DeploymentProgressProps) => {
  return (
    <div className="mt-4 p-4 rounded-md bg-gray-50 border border-gray-200">
      <div className="flex items-start space-x-2">
        {isLoading ? (
          <Spinner className="h-5 w-5 text-indigo-600" />
        ) : (
          <span className={`text-sm ${status.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {status}
          </span>
        )}
        {status.startsWith('Error') && (
          <button 
            onClick={() => navigator.clipboard.writeText(status)}
            className="text-xs text-red-500 hover:text-red-700"
            title="Copy error"
          >
            Copy
          </button>
        )}
      </div>
    </div>
  )
}
