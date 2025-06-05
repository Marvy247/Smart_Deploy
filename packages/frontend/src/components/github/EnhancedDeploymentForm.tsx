import { useState } from 'react'
import { useGitHubAPI, Repository, Workflow } from '../../services/github'
import RepoSelector from './RepoSelector'
import WorkflowSelector from './WorkflowSelector'
import { DeploymentProgress } from './DeploymentProgress'

interface EnhancedDeploymentFormProps {
  onDeploy: (
    repo: string, 
    workflowId: string, 
    branch: string, 
    inputs: {
      network: string
      gasPrice?: string
    }
  ) => Promise<void>
}

export const EnhancedDeploymentForm = ({ onDeploy }: EnhancedDeploymentFormProps) => {
  const [selectedRepo, setSelectedRepo] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState('')
  const [branch, setBranch] = useState('main')
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState('')
  const { fetchWorkflows } = useGitHubAPI()

  const handleRepoSelect = async (repo: Repository) => {
    setSelectedRepo(repo.full_name)
    setSelectedWorkflow('')
    try {
      const workflows = await fetchWorkflows(repo.full_name)
      if (workflows.length > 0) {
        setSelectedWorkflow(workflows[0].id.toString())
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setCustomInputs(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRepo || !selectedWorkflow) {
      setDeploymentStatus('Error: Please select a repository and workflow')
      return
    }

    if (!customInputs.network) {
      setDeploymentStatus('Error: Network selection is required')
      return
    }

    setIsLoading(true)
    setDeploymentStatus('Starting deployment...')
    
    try {
      await onDeploy(
        selectedRepo, 
        selectedWorkflow, 
        branch, 
        {
          network: customInputs.network,
          gasPrice: customInputs.gasPrice
        }
      )
      setDeploymentStatus('Deployment triggered successfully!')
    } catch (error) {
      setDeploymentStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Deployment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium mb-4">Smart Contract Deployment</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Repository</label>
              <RepoSelector onSelect={handleRepoSelect} />
            </div>

            {selectedRepo && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Workflow</label>
                <WorkflowSelector
                  repoFullName={selectedRepo}
                  onSelect={(workflow: Workflow) => setSelectedWorkflow(workflow.id.toString())}
                />
              </div>
            )}

            {selectedRepo && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}
          </div>

          {selectedWorkflow && (
            <div className="space-y-4">
              <h3 className="text-md font-medium">Deployment Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Network</label>
                  <select 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={customInputs.network || ''}
                    onChange={(e) => handleInputChange('network', e.target.value)}
                    required
                  >
                    <option value="">Select network</option>
                    <option value="mainnet">Mainnet</option>
                    <option value="sepolia">Sepolia</option>
                    <option value="goerli">Goerli</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gas Price (Gwei)</label>
                  <input
                    type="number"
                    value={customInputs.gasPrice || ''}
                    onChange={(e) => handleInputChange('gasPrice', e.target.value)}
                    placeholder="Auto"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={!selectedRepo || !selectedWorkflow || isLoading}
              className="w-full md:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deploying...' : 'Deploy Contract'}
            </button>
          </div>

          {deploymentStatus && (
            <DeploymentProgress status={deploymentStatus} isLoading={isLoading} />
          )}
        </div>
      </form>
    </div>
  )
}
