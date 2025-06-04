import { useGitHubAuth } from '../contexts/GitHubAuthContext'

export interface Repository {
  id: number
  name: string
  full_name: string
  html_url: string
  default_branch: string
  language: string
}

export interface Workflow {
  id: number
  name: string
  path: string
  state: string
}

export const useGitHubAPI = () => {
  const { token } = useGitHubAuth()

  const fetchRepositories = async (): Promise<Repository[]> => {
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch('https://api.github.com/user/repos?per_page=100', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch repositories')
    return response.json()
  }

  const fetchWorkflows = async (repoFullName: string): Promise<Workflow[]> => {
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/actions/workflows`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch workflows')
    const data = await response.json()
    return data.workflows
  }

  const triggerWorkflow = async (repoFullName: string, workflowId: string, branch: string): Promise<void> => {
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/actions/workflows/${workflowId}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: branch
      })
    })
    
    if (!response.ok) throw new Error('Failed to trigger workflow')
  }

  return {
    token,
    fetchRepositories,
    fetchWorkflows, 
    triggerWorkflow
  }
}
