import React, { useEffect, useState } from 'react'
import { useGitHubAPI } from '../../services/github'

interface DeploymentStatusProps {
  repoFullName: string
  runId: string
}

export const DeploymentStatus = ({ repoFullName, runId }: DeploymentStatusProps) => {
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'failed'>('pending')
  const [error, setError] = useState<string | null>(null)
  const { token } = useGitHubAPI()

  useEffect(() => {
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
  }, [repoFullName, runId, token])

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'in_progress':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`font-medium ${getStatusColor()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </div>
      {(status === 'pending' || status === 'in_progress') && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-indigo-600" />
      )}
    </div>
  )
}
