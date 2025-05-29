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

program.parse(process.argv);
