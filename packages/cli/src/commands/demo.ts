import { Command } from 'commander';
import { DeploymentHistory } from '../deploy/history';
import { DeploymentStatus } from '../deploy/types';
import { SERVEL_ART } from './demo/ascii-art';

export function createDemoCommand(program: Command) {
  program
    .command('demo')
    .description('Demonstrate deployment history and rollback functionality')
    .option('-n, --network <network>', 'Network to demonstrate (default: localhost)', 'localhost')
    .action(async (options) => {
      try {
        const history = new DeploymentHistory();
        
        console.log(SERVEL_ART);
        console.log('\n=== Servel Deployment Demo ===');
        console.log('1. Simulating successful deployment...');
        
        // Create mock deployment
        const deployment1 = {
          success: true,
          deploymentId: 'demo-1',
          contractName: 'DemoContract',
          network: options.network,
          status: 'success' as const,
          timestamp: Date.now(),
          artifacts: {
            abi: '[]',
            bytecode: '0x',
            source: 'contract Demo {}'
          }
        };
        
        await history.addDeployment(deployment1);
        console.log('✅ Added deployment to history:', deployment1.deploymentId);

        console.log('\n2. Simulating failed deployment...');
        const deployment2 = {
          ...deployment1,
          success: false,
          deploymentId: 'demo-2',
          status: 'failed' as const,
          timestamp: Date.now() + 1000
        };
        
        await history.addDeployment(deployment2);
        console.log('✅ Added failed deployment to history:', deployment2.deploymentId);

        console.log('\n3. Simulating rollback...');
        await history.markAsRolledBack(deployment2.deploymentId, {
          reason: 'Contract initialization failed',
          rolledBackTo: deployment1.deploymentId,
          rolledBackFrom: deployment2.deploymentId
        });
        console.log('✅ Marked deployment as rolled back:', deployment2.deploymentId);

        console.log('\n4. Retrieving deployment history...');
        const allDeployments = (history as any).getHistory();
        console.log('📜 Full deployment history:');
        console.table(allDeployments.map((d: any) => ({
          id: d.deploymentId,
          contract: d.contractName,
          network: d.network,
          status: d.status,
          timestamp: new Date(d.timestamp!).toLocaleString(),
          rollback: d.rollbackReason ? `Rolled back to ${d.rolledBackTo}` : '-'
        })));

        console.log('\n🎉 Demo completed successfully!');
      } catch (error) {
        console.error('Demo failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
