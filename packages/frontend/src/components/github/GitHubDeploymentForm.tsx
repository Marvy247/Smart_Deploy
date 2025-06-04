import { useState } from 'react'
import { useGitHubAPI, Repository, Workflow } from '../../services/github'
import RepoSelector from './RepoSelector'
import WorkflowSelector from './WorkflowSelector'

interface GitHubDeploymentFormProps {
  onDeploy: (repo: string, workflowId: string, branch: string) => void
}

export const GitHubDeploymentForm = ({ onDeploy }: GitHubDeploymentFormProps) => {
  const [selectedRepo, setSelectedRepo] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState('')
  const [branch, setBranch] = useState('main')
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRepo || !selectedWorkflow) return
    setIsLoading(true)
    onDeploy(selectedRepo, selectedWorkflow, branch)
    setIsLoading(false)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium mb-4">GitHub Actions Deployment</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={!selectedRepo || !selectedWorkflow || isLoading}
              className="w-full md:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
