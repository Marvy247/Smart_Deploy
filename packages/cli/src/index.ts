import { Command } from 'commander';

const program = new Command();

program
  .name('smart-deploy')
  .description('Smart Deploy CLI tool')
  .version('0.1.0');

import { spawn } from 'child_process';

program
  .command('init')
  .description('Initialize the Smart Deploy project')
  .action(() => {
    console.log('Smart Deploy project initialized');
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

import { loadConfig } from './config';

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

program.parse(process.argv);
