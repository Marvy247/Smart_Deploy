import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DashboardPage from '../dashboard'
import { mockContractMetrics } from '@/tests/mocks/contractMetrics'

describe('DashboardPage', () => {
  const mockProps = {
    verification: {
      sourcify: true,
      etherscan: true,
      lastChecked: new Date().toISOString()
    },
    security: {
      vulnerabilities: 0,
      warnings: 0,
      optimizations: 0,
      score: 100,
      lastRun: new Date().toISOString()
    },
    deployments: [{
      contractName: 'TestContract',
      network: 'mainnet',
      address: '0x123...',
      deployer: '0x456...',
      timestamp: new Date().toISOString(),
      txHash: '0x789...',
      gasUsed: 100000
    }]
  }

  it('renders loading state initially', () => {
    render(<DashboardPage {...mockProps} />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('renders error state when fetch fails', async () => {
    jest.spyOn(require('@/services/contractMetrics'), 'fetchContractMetrics')
      .mockRejectedValue(new Error('Failed to fetch'))
    
    render(<DashboardPage {...mockProps} />)
    await waitFor(() => {
      expect(screen.getByText(/Failed to load contract metrics/)).toBeInTheDocument()
    })
  })

  it('renders dashboard with metrics when fetch succeeds', async () => {
    jest.spyOn(require('@/services/contractMetrics'), 'fetchContractMetrics')
      .mockResolvedValue(mockContractMetrics)
    
    render(<DashboardPage {...mockProps} />)
    await waitFor(() => {
      expect(screen.getByText('Contract Metrics')).toBeInTheDocument()
      expect(screen.getByText(/Last refreshed/)).toBeInTheDocument()
    })
  })

  it('handles refresh button click', async () => {
    const mockFetch = jest.spyOn(require('@/services/contractMetrics'), 'fetchContractMetrics')
      .mockResolvedValue(mockContractMetrics)
    
    render(<DashboardPage {...mockProps} />)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    fireEvent.click(screen.getByText('Refresh'))
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('formats dates correctly', async () => {
    jest.spyOn(require('@/services/contractMetrics'), 'fetchContractMetrics')
      .mockResolvedValue(mockContractMetrics)
    
    const testDate = new Date('2023-01-01T12:00:00Z')
    render(<DashboardPage {...mockProps} deployments={[{
      ...mockProps.deployments[0],
      timestamp: testDate.toISOString()
    }]} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Jan 1, 2023.*12:00/)).toBeInTheDocument()
    })
  })
})
