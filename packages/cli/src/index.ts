import { Command } from 'commander';

const program = new Command();

program
  .name('servel')
  .description('Servel CLI - Smart Contract Deployment Manager')
  .version('0.1.0');

import { spawn } from 'child_process';
import { loadConfig } from './config';
import { runSlither } from './audit/slither';
import { deployContract } from './deploy';
import { createDemoCommand } from './commands/demo';
import type { Finding } from './audit/types';

function printFindings(title: string, findings: Finding[], isDeployment = false) {
  const emoji = isDeployment ? '⚠️' : '🔍';
  const width = isDeployment ? 40 : 30;
  
  console.log(`\n${emoji} ${title}:`);
  console.log('='.repeat(width));
  
  findings.forEach((f: Finding, i: number) => {
    const severity = f.severity.toUpperCase();
    console.log(`\n${i+1}. ${f.description}`);
    console.log(`   Severity: ${severity}`);
    console.log(`   Impact: ${f.impact}`);
    if (isDeployment) {
      console.log(`   Confidence: ${f.confidence}`);
    }
  });
  
  console.log('\n' + '='.repeat(width));
}

program
  .command('init')
  .description('Initialize the Servel project')
  .action(() => {
    console.log('Servel project initialized');
  });

program
  .command('forge-build')
  .description('Run forge build command')
  .action(() => {
    const forgeBuild = spawn('forge', ['build'], { stdio: 'inherit' });

    forgeBuild.on('close', (code) => {
      if (code === 0) {
        console.log('Forge build completed successfully.');
      } else {
        console.error(`Forge build process exited with code ${code}`);
      }
    });
  });

program
  .command('forge-test')
  .description('Run forge test command')
  .action(() => {
    const forgeTest = spawn('forge', ['test'], { stdio: 'inherit' });

    forgeTest.on('close', (code) => {
      if (code === 0) {
        console.log('Forge test completed successfully.');
      } else {
        console.error(`Forge test process exited with code ${code}`);
      }
    });
  });

program
  .command('config-validate')
  .description('Validate a project configuration file')
  .argument('<configPath>', 'Path to the config file (JSON or YAML)')
  .action((configPath: string) => {
    try {
      const config = loadConfig(configPath);
      console.log('Configuration is valid:', config);
    } catch (error: any) {
      console.error('Configuration validation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('audit')
  .description('Run security audit on smart contracts')
  .argument('<contractPath>', 'Path to the contract file or directory')
  .action(async (contractPath: string) => {
    try {
      const result = await runSlither(contractPath);
      if (!result.success) {
        console.error('Audit failed:', result.error);
        process.exit(1);
      }
      console.log('Audit completed successfully');
      if (result.tools.some(tool => tool.findings.length > 0)) {
        result.tools.forEach(tool => {
          if (tool.findings.length > 0) {
            printFindings(`Security Audit Results (${tool.toolName})`, tool.findings);
          }
        });
      } else {
        console.log('\n✅ No security issues found');
      }
    } catch (error) {
      console.error('Audit failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('deploy')
  .description('Deploy smart contracts to specified network')
  .requiredOption('-n, --network <network>', 'Target network (e.g. mainnet, goerli)')
  .requiredOption('-c, --contract <contract>', 'Contract name to deploy')
  .option('-f, --config <path>', 'Path to deployment config file', './deploy.config.json')
  .action(async (options) => {
    try {
      const result = await deployContract(options);
      
      if (result.auditResult?.tools.some(tool => tool.findings.length > 0)) {
        result.auditResult.tools.forEach(tool => {
          if (tool.findings.length > 0) {
            printFindings(`Deployment Audit Results (${tool.toolName})`, tool.findings, true);
          }
        });
        
        if (!result.success) {
          console.error('\nDeployment was cancelled due to security warnings');
          process.exit(1);
        } else {
          console.log('\nDeployment completed with security warnings acknowledged');
        }
      } else if (result.success) {
        console.log('\nDeployment completed successfully with no security issues');
      }
    } catch (error) {
      console.error('\nDeployment failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Register demo command
createDemoCommand(program);

program.parse(process.argv);
