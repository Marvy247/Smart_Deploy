import { 
  DeployOptions, 
  DeploymentResult,
  RollbackOptions,
  DeploymentStatus,
  DeploymentRecord
} from './types';
import { DeploymentHistory } from './history';
import { getNetworkConfig } from './networks';
import { runSlither } from '../audit/slither';
import type { AuditResult, Finding } from '../audit/types';
import * as readline from 'readline';

export * from './types';
export * from './networks';

export interface FullDeploymentResult extends DeploymentResult {
  auditResult?: AuditResult;
}

export async function rollbackDeployment(options: RollbackOptions): Promise<DeploymentResult> {
  const { deploymentId, reason, config } = options;
  console.log(`Attempting to rollback deployment ${deploymentId}`);
  const history = new DeploymentHistory();
  
  try {
    const deployment = await history.getDeployment(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    const previousVersion = await history.getPreviousVersion(
      deployment.contractName,
      deployment.network
    );

    if (!previousVersion) {
      throw new Error('No previous version available for rollback');
    }

    const networkConfig = getNetworkConfig(deployment.network, config);
    if (!networkConfig.deployer) {
      throw new Error(`No deployer configured for network ${deployment.network}`);
    }

    const rollbackResult = await networkConfig.deployer.deploy(
      deployment.contractName,
      networkConfig
    );

    if (!rollbackResult.success) {
      throw new Error(rollbackResult.error || 'Rollback deployment failed');
    }

    await history.markAsRolledBack(deploymentId, {
      reason,
      rolledBackTo: rollbackResult.contractAddress,
      rolledBackFrom: deployment.contractAddress
    });

    console.log(`✅ Rollback completed for deployment ${deploymentId}`);
    return {
      ...rollbackResult,
      deploymentId: deploymentId,
      timestamp: Date.now(),
      status: 'rolledback'
    };
  } catch (error) {
    console.error(`❌ Rollback failed for deployment ${deploymentId}:`, error instanceof Error ? error.message : error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      deploymentId: deploymentId,
      timestamp: Date.now(),
      status: 'failed'
    };
  }
}

export async function deployContract(options: DeployOptions): Promise<FullDeploymentResult> {
  const { network, contract, config } = options;
  const deploymentId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const history = new DeploymentHistory();
  
  try {
    console.log(`Preparing to deploy ${contract} to ${network}`);
    console.log(`Deployment ID: ${deploymentId}`);
    const networkConfig = getNetworkConfig(network, config);
    
    console.log('Running security audit...');
    const auditResult = await runSlither(contract);
    
    if (auditResult.tools.some(tool => tool.findings.length > 0)) {
      console.warn('Vulnerabilities found:');
      auditResult.tools.forEach(tool => {
        tool.findings.forEach((f: Finding) => 
          console.warn(`[${tool.toolName}] ${f.severity.toUpperCase()}: ${f.description}`));
      });
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise<string>(resolve => {
        rl.question('Continue with deployment despite vulnerabilities? (y/N) ', resolve);
      });
      rl.close();
      
      if (!answer || answer.toLowerCase() !== 'y') {
        console.log('Deployment cancelled');
        return { 
          success: false, 
          error: 'Deployment cancelled due to vulnerabilities',
          auditResult: {
            ...auditResult,
            passed: false
          },
          deploymentId,
          timestamp: Date.now(),
          status: 'failed'
        };
      }
    }

    console.log('Network configuration:', networkConfig);
    console.log('Starting deployment process...');
    
    if (!networkConfig.deployer) {
      throw new Error(`No deployer configured for network ${network}`);
    }

    try {
      const deploymentResult = await networkConfig.deployer.deploy(
        contract,
        networkConfig
      );
      
      if (!deploymentResult.success) {
        throw new Error(deploymentResult.error || 'Deployment failed');
      }

      console.log('✅ Deployment completed successfully');
      console.log(`Contract address: ${deploymentResult.contractAddress}`);
      console.log(`Transaction hash: ${deploymentResult.txHash}`);
      console.log(`Gas used: ${deploymentResult.gasUsed}`);
      
      const record: DeploymentRecord = {
        ...deploymentResult,
        contractName: contract,
        network,
        artifacts: {
          abi: '', // Will be populated with actual ABI
          bytecode: '', // Will be populated with actual bytecode
          source: '' // Will be populated with source code
        },
        auditResult: {
          ...auditResult,
          passed: true,
          tools: auditResult.tools.map(tool => ({
            ...tool,
            findings: tool.findings.map(f => ({
              description: f.description,
              severity: f.severity,
              impact: f.impact,
              confidence: f.confidence || 'medium',
              tool: tool.toolName as 'slither' | 'mythx' | 'other',
              remediation: f.remediation || '',
              references: f.references || []
            }))
          }))
        },
        success: true,
        deploymentId,
        timestamp: Date.now(),
        status: 'success'
      };
      
      await history.addDeployment(record);
      return record;
    } catch (error) {
      console.error('❌ Deployment failed:', error instanceof Error ? error.message : error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        auditResult: {
          ...auditResult,
          passed: false
        },
        deploymentId,
        timestamp: Date.now(),
        status: 'failed'
      };
    }
  } catch (error) {
    console.error('Deployment failed:', error instanceof Error ? error.message : error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      status: 'failed'
    };
  }
}
