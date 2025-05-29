import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { deployContract } from '../../deploy';

const router = Router();

// Start a new deployment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, contractName, contractPath, network, privateKey } = req.body;

    if (!projectId || !contractName || !contractPath || !network || !privateKey) {
      return res.status(400).json({
        message: 'Missing required fields: projectId, contractName, contractPath, network, privateKey'
      });
    }

    const contract = await deployContract({
      network,
      privateKey,
      rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
      etherscanApiKey: process.env.ETHERSCAN_API_KEY
    }, contractName, contractPath);

    res.status(201).json({
      projectId,
      deploymentId: Date.now(),
      status: 'success',
      contractAddress: contract.target.toString(),
      network
    });
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({
      message: 'Deployment failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get deployment status
router.get('/:deploymentId', authenticateToken, (req, res) => {
  // Mock deployment status - replace with actual deployment tracking
  res.json({
    deploymentId: req.params.deploymentId,
    status: 'completed',
    timestamp: new Date().toISOString()
  });
});

export default router;
