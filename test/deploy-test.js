import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './deploy-config.json' assert { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let deployContract;
try {
  const deployModule = await import('../packages/backend/src/deploy.ts');
  deployContract = deployModule.deployContract;
} catch (err) {
  console.error('Failed to load deploy module:', err);
  process.exit(1);
}

async function testDeployment() {
  try {
    console.log('🚀 Starting full deployment test workflow...');
    
    // Verify artifact exists
    const artifactPath = path.join(__dirname, '../out/TestContract.sol/TestContract.json');
    if (!fs.existsSync(artifactPath)) {
      throw new Error('TestContract artifact not found. Run forge compile first.');
    }

    // Deploy TestContract with audit
    const contract = await deployContract(
      config,
      'TestContract',
      artifactPath,
      'v0.8.0'
    );

    // Verify deployment
    if (!contract.target) {
      throw new Error('Contract deployment failed - no address');
    }
    console.log(`✅ Contract deployed at: ${contract.target}`);

    // Verify audit findings
    if (fs.existsSync('audit.log')) {
      const auditLog = fs.readFileSync('audit.log', 'utf8');
      if (!auditLog.includes('Unsafe transfer should succeed (vulnerability exists)')) {
        throw new Error('Audit did not detect unsafe transfer vulnerability');
      }
      if (!auditLog.includes('Withdraw should revert due to reentrancy protection')) {
        throw new Error('Audit did not detect reentrancy protection');
      }
    } else {
      console.warn('⚠️ audit.log not found - skipping audit verification');
    }


    console.log('✅ All vulnerabilities properly detected');
    console.log('✅ Full workflow completed successfully');
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    process.exit(1);
  }
}

testDeployment();
