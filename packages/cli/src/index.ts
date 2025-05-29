import { Command } from 'commander';

const program = new Command();

program
  .name('smart-deploy')
  .description('Smart Deploy CLI tool')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize the Smart Deploy project')
  .action(() => {
    console.log('Smart Deploy project initialized');
  });

program.parse(process.argv);
