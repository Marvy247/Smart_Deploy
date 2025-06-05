import React, { useEffect, useState } from 'react'
import { useGitHubAPI } from '../../services/github'

interface DeploymentStatusProps {
  /**
   * The full name of the GitHub repository (owner/repo)
   * @example "octocat/hello-world"
   */
  repoFullName: string

  /**
   * The GitHub Actions run ID to track
   * @example "1658821493"
   */
  runId: string

  /**
   * Optional additional CSS classes to apply to the status container
   * @example "mt-4"
   */
  className?: string

  /**
   * Current deployment status (for testing purposes)
   */
  status?: 'pending' | 'in_progress' | 'completed' | 'failed'

  /**
   * Error message to display (for testing purposes)
   */
  error?: string
}

export const DeploymentStatus = ({ 
  repoFullName, 
  runId, 
  className,
  status: propStatus,
  error: propError 
}: DeploymentStatusProps) => {
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'failed'>(propStatus || 'pending')
  const [error, setError] = useState<string | null>(propError || null)
  const { token } = useGitHubAPI()

  useEffect(() => {
    // Only fetch status if not provided via props
    if (!propStatus) {
      const checkStatus = async () => {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${repoFullName}/actions/runs/${runId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
              },
            }
          )

          if (!response.ok) throw new Error('Failed to fetch deployment status')
          
          const data = await response.json()
          setStatus(data.status)
        } catch (err) {
          setError('Failed to check deployment status')
          console.error('Error checking deployment status:', err)
        }
      }

      const interval = setInterval(checkStatus, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [repoFullName, runId, token, propStatus])

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          icon: '✅'
        }
      case 'failed':
        return {
          color: 'text-red-600', 
          bg: 'bg-red-50',
          icon: '❌'
        }
      case 'in_progress':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          icon: '🔄'
        }
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          icon: '⏳'
        }
    }
  }

  const config = getStatusConfig()

  if (error) {
    return (
      <div className={`p-3 rounded-md bg-red-50 ${className || ''}`}>
        <div className="flex items-start justify-between">
          <div className="text-red-600 text-sm font-medium">{error}</div>
          <button
            onClick={() => navigator.clipboard.writeText(error)}
            className="text-xs text-red-500 hover:text-red-700 ml-2"
            title="Copy error"
          >
            Copy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-md ${config.bg} ${className || ''}`}>
      <div className="flex items-center space-x-2">
        <span className={config.color}>{config.icon}</span>
        <div className={`font-medium ${config.color}`}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </div>
        {(status === 'pending' || status === 'in_progress') && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-indigo-600" />
        )}
      </div>
    </div>
  )
}
