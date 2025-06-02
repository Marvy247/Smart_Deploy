const { execSync } = require('child_process');
const path = require('path');

const contractPath = path.join(__dirname, 'test/VulnerableContract.sol');
const configPath = path.join(__dirname, 'slither.config.json');

console.log(`Testing reentrancy detection on ${contractPath}`);

// Try all reentrancy detection variants
const detectors = [
  'reentrancy-eth',
  'reentrancy-no-eth', 
  'reentrancy-benign'
];

detectors.forEach(detector => {
  try {
    console.log(`\n=== Testing with ${detector} detector ===`);
    const cmd = `slither ${contractPath} --detect ${detector} --config ${configPath} --json -`;
    console.log(`Executing: ${cmd}`);
    
    const output = execSync(cmd, { encoding: 'utf-8' });
    const result = JSON.parse(output);
    
    console.log('✅ Slither output:', JSON.stringify(result, null, 2));
    
    if (result.success && result.results?.detectors?.length > 0) {
      console.log(`🚨 Found ${result.results.detectors.length} issues with ${detector}`);
    } else {
      console.log(`❌ No issues found with ${detector}`);
    }
  } catch (error) {
    console.error(`⚠️ Error with ${detector}:`, error.message);
    if (error.stdout) console.log('Stdout:', error.stdout);
    if (error.stderr) console.log('Stderr:', error.stderr);
  }
});

// Additional debug info
console.log('\n=== Debug Info ===');
console.log('Contract:', contractPath);
console.log('Config:', configPath);
console.log('Solc version:', execSync('solc --version', { encoding: 'utf-8' }));
console.log('Slither version:', execSync('slither --version', { encoding: 'utf-8' }));
