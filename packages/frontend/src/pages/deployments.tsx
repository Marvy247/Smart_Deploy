import { NextPage } from 'next'
import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { Deployment } from '../types/deployment'
import { DeploymentsTable } from '../components/dashboard/MemoizedComponents'
import { GitHubDeploymentForm } from '../components/github/GitHubDeploymentForm'
import { DeploymentStatus } from '../components/github/DeploymentStatus'
import { useGitHubAPI } from '../services/github'

const DeploymentsPage: NextPage = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [activeDeployment, setActiveDeployment] = useState<{
    repoFullName: string
    runId: string
  } | null>(null)
  const { triggerWorkflow } = useGitHubAPI()

  const handleDeploy = async (repo: string, workflowId: string, branch: string) => {
    try {
      await triggerWorkflow(repo, workflowId, branch)
      // Add deployment to list
      const newDeployment: Deployment = {
        contractName: repo.split('/')[1], // Use repo name as contract name
        network: 'github',
        address: '-',
        deployer: 'GitHub Actions',
        timestamp: new Date().toISOString(),
        txHash: '-',
        gasUsed: '0',
        githubRepo: repo,
        githubWorkflow: workflowId,
        githubStatus: 'pending'
      }
      setDeployments([newDeployment, ...deployments])
      setActiveDeployment({ repoFullName: repo, runId: workflowId })
    } catch (error) {
      console.error('Failed to trigger deployment:', error)
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Deployment History</h1>
        
        <GitHubDeploymentForm onDeploy={handleDeploy} />
        
        {activeDeployment && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Active Deployment</h2>
            <DeploymentStatus 
              repoFullName={activeDeployment.repoFullName}
              runId={activeDeployment.runId}
            />
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <DeploymentsTable deployments={deployments} />
        </div>
      </div>
    </Layout>
  )
}

export default DeploymentsPage
