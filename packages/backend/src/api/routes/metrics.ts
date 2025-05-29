import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Mock data - replace with actual data in production
const mockMetrics = {
  contractHealth: {
    status: 'healthy',
    uptime: 99.9,
    lastUpdate: new Date().toISOString(),
  },
  transactions: {
    daily: [
      { date: '2024-05-22', count: 150, gasUsed: 3500000 },
      { date: '2024-05-23', count: 165, gasUsed: 3750000 },
      { date: '2024-05-24', count: 180, gasUsed: 4000000 },
      { date: '2024-05-25', count: 145, gasUsed: 3250000 },
      { date: '2024-05-26', count: 190, gasUsed: 4250000 },
      { date: '2024-05-27', count: 175, gasUsed: 3900000 },
      { date: '2024-05-28', count: 200, gasUsed: 4500000 },
    ],
  },
  events: [
    { 
      timestamp: '2024-05-28T10:00:00Z',
      type: 'ContractDeployed',
      details: 'Contract successfully deployed'
    },
    {
      timestamp: '2024-05-28T11:30:00Z',
      type: 'FunctionCalled',
      details: 'updateStatus function called'
    },
    {
      timestamp: '2024-05-28T12:45:00Z',
      type: 'EventEmitted',
      details: 'StatusUpdated event emitted'
    }
  ],
  logs: [
    {
      timestamp: '2024-05-28T10:00:00Z',
      level: 'info',
      message: 'Contract deployment initiated'
    },
    {
      timestamp: '2024-05-28T10:00:05Z',
      level: 'success',
      message: 'Contract deployed successfully'
    },
    {
      timestamp: '2024-05-28T11:30:00Z',
      level: 'info',
      message: 'Function call received'
    }
  ]
};

// Get contract health status
router.get('/health', authenticateToken, (req, res) => {
  res.json(mockMetrics.contractHealth);
});

// Get transaction metrics
router.get('/transactions', authenticateToken, (req, res) => {
  res.json(mockMetrics.transactions);
});

// Get contract events
router.get('/events', authenticateToken, (req, res) => {
  res.json(mockMetrics.events);
});

// Get contract logs
router.get('/logs', authenticateToken, (req, res) => {
  res.json(mockMetrics.logs);
});

export default router;
