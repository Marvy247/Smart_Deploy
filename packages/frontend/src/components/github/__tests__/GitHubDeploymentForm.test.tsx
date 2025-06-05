import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GitHubDeploymentForm } from '../GitHubDeploymentForm'
import { useGitHubAPI, Repository, Workflow } from '@/services/github'
import { GitHubAuthProvider } from '@/contexts/GitHubAuthContext'

// Mock the GitHub API service
jest.mock('@/services/github')

// Custom render function with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <GitHubAuthProvider>
      {ui}
    </GitHubAuthProvider>
  )
}

const mockUseGitHubAPI = useGitHubAPI as jest.MockedFunction<typeof useGitHubAPI>

const mockRepository: Repository = {
  id: 1,
  name: 'test-repo',
  full_name: 'test-org/test-repo',
  html_url: 'https://github.com/test-org/test-repo',
  default_branch: 'main',
  language: 'TypeScript',
  owner: {
    avatar_url: '',
    login: 'test-org'
  }
}

const mockWorkflow: Workflow = {
  id: 123,
  name: 'Deploy Contract',
  path: '.github/workflows/deploy.yml',
  state: 'active'
}

describe('GitHubDeploymentForm', () => {
  const mockDeploy = jest.fn()
  const mockWorkflows = [mockWorkflow]

  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'test-token')
    
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn(),
      fetchWorkflows: jest.fn().mockResolvedValue(mockWorkflows),
      triggerWorkflow: jest.fn().mockResolvedValue(undefined)
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should render the form', () => {
    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    expect(screen.getByText('GitHub Actions Deployment')).toBeInTheDocument()
    expect(screen.getByLabelText('Repository')).toBeInTheDocument()
  })

  it('should call onDeploy with correct parameters when form is submitted', async () => {
    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    // Simulate selecting a repo
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByLabelText('Workflow')).toBeInTheDocument()
    })

    // Submit form
    fireEvent.click(screen.getByText('Deploy'))

    await waitFor(() => {
      expect(mockDeploy).toHaveBeenCalledWith(
        'test-org/test-repo',
        '123',
        'main'
      )
    })
  })

  it('should handle workflow trigger errors', async () => {
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn(),
      fetchWorkflows: jest.fn().mockRejectedValue(new Error('Failed to fetch workflows')),
      triggerWorkflow: jest.fn()
    })

    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    await waitFor(() => {
      expect(screen.getByText('Failed to load workflows')).toBeInTheDocument()
    })
  })

  it('should disable submit button when no repo is selected', () => {
    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    expect(screen.getByText('Deploy')).toBeDisabled()
  })

  it('should show loading state during workflow fetch', async () => {
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn(),
      fetchWorkflows: jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockWorkflows), 100))
      ),
      triggerWorkflow: jest.fn()
    })

    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })

  it('should handle workflow trigger failure', async () => {
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn(),
      fetchWorkflows: jest.fn().mockResolvedValue(mockWorkflows),
      triggerWorkflow: jest.fn().mockRejectedValue(new Error('Trigger failed'))
    })

    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Workflow')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Deploy'))

    await waitFor(() => {
      expect(screen.getByText('Deployment failed')).toBeInTheDocument()
    })
  })

  it('should handle empty workflows list', async () => {
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn(),
      fetchWorkflows: jest.fn().mockResolvedValue([]),
      triggerWorkflow: jest.fn()
    })

    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    await waitFor(() => {
      expect(screen.getByText('No workflows found')).toBeInTheDocument()
    })
    expect(screen.getByText('Deploy')).toBeDisabled()
  })

  it('should allow branch selection', async () => {
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn().mockResolvedValue([{
        ...mockRepository,
        branches: ['main', 'develop']
      }]),
      fetchWorkflows: jest.fn().mockResolvedValue(mockWorkflows),
      triggerWorkflow: jest.fn()
    })

    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Branch')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Branch'), {
      target: { value: 'develop' }
    })

    fireEvent.click(screen.getByText('Deploy'))

    await waitFor(() => {
      expect(mockDeploy).toHaveBeenCalledWith(
        'test-org/test-repo',
        '123',
        'develop'
      )
    })
  })

  it('should validate repository format', async () => {
    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'invalid-repo-format' }
    })

    await waitFor(() => {
      expect(screen.getByText('Invalid repository format')).toBeInTheDocument()
    })
    expect(screen.getByText('Deploy')).toBeDisabled()
  })

  it('should meet accessibility requirements', async () => {
    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    expect(screen.getByLabelText('Repository')).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'GitHub deployment form')
    expect(screen.getByText('Deploy')).toHaveAttribute('aria-busy', 'false')
  })

  it('should match snapshot', () => {
    const { container } = render(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    expect(container).toMatchSnapshot()
  })

  it('should handle multiple workflows selection', async () => {
    const multipleWorkflows = [
      mockWorkflow,
      {...mockWorkflow, id: 124, name: 'Test Workflow'}
    ]
    
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn(),
      fetchWorkflows: jest.fn().mockResolvedValue(multipleWorkflows),
      triggerWorkflow: jest.fn()
    })

    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBe(2)
    })
  })

  it('should have proper loading state accessibility', async () => {
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn(),
      fetchWorkflows: jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockWorkflows), 100))
      ),
      triggerWorkflow: jest.fn()
    })

    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    const loading = screen.getByText('Loading...')
    expect(loading).toHaveAttribute('aria-live', 'polite')
    expect(loading).toHaveAttribute('role', 'status')

    await waitFor(() => {
      expect(loading).not.toBeInTheDocument()
    })
  })

  it('should handle keyboard navigation', async () => {
    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    const repoInput = screen.getByLabelText('Repository')
    fireEvent.keyDown(repoInput, { key: 'Enter', code: 'Enter' })
    expect(repoInput).toHaveFocus()

    fireEvent.keyDown(repoInput, { key: 'Tab', code: 'Tab' })
    expect(screen.getByText('Deploy')).toHaveFocus()
  })

  it('should show accessible error messages', async () => {
    mockUseGitHubAPI.mockReturnValue({
      token: 'test-token',
      fetchRepositories: jest.fn(),
      fetchWorkflows: jest.fn().mockRejectedValue(new Error('API Error')),
      triggerWorkflow: jest.fn()
    })

    renderWithProviders(<GitHubDeploymentForm onDeploy={mockDeploy} />)
    
    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'test-org/test-repo' }
    })

    await waitFor(() => {
      const error = screen.getByText('Failed to load workflows')
      expect(error).toHaveAttribute('id')
      expect(screen.getByLabelText('Repository')).toHaveAttribute('aria-describedby', error.id)
    })
  })
})
