import React from 'react'
import { render, screen } from '@testing-library/react'
import { DeploymentStatus } from '../DeploymentStatus'

describe('DeploymentStatus', () => {
  const mockProps = {
    repoFullName: 'owner/repo',
    runId: '123'
  }

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'completed' }),
      } as Response)
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('applies custom className when provided', () => {
    render(<DeploymentStatus {...mockProps} className="custom-class" />)
    const container = screen.getByTestId('deployment-status')
    expect(container).toHaveClass('custom-class')
  })

  it('renders without className when not provided', () => {
    render(<DeploymentStatus {...mockProps} />)
    const container = screen.getByTestId('deployment-status')
    expect(container).not.toHaveClass('custom-class')
  })

  it('renders different status states correctly', () => {
    const { rerender } = render(<DeploymentStatus {...mockProps} />)
    
    // Test pending state
    expect(screen.getByText('Pending')).toBeInTheDocument()
    
    // Test in_progress state
    rerender(<DeploymentStatus {...mockProps} status="in_progress" />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
    
    // Test completed state
    rerender(<DeploymentStatus {...mockProps} status="completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
    
    // Test failed state
    rerender(<DeploymentStatus {...mockProps} status="failed" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('does not poll for status when status prop is provided', () => {
    render(<DeploymentStatus {...mockProps} status="completed" />)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('polls for status when status prop is not provided', () => {
    render(<DeploymentStatus {...mockProps} />)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('shows error message when error occurs', () => {
    render(<DeploymentStatus {...mockProps} error="Test error" />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows error from API when fetch fails', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('API error'))
    )
    render(<DeploymentStatus {...mockProps} />)
    await screen.findByText('Failed to check deployment status')
  })
})
