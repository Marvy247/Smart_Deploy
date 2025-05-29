import { deployContract, DeploymentConfig } from './deploy';

async function runTests() {
  const validConfig: DeploymentConfig = {
    network: 'sepolia',
    privateKey: '0x51ac03291cd2068d48531ddb2b4d3bac5ba418e61d7b4c79c55a7bbf63452381',
    rpcUrl: 'https://methodical-misty-arm.ethereum-sepolia.quiknode.pro/94a7e73a053ca28e2f3a64e40c7ca0e0bd6d38d9/'
  };


  const invalidConfig: DeploymentConfig = {
    network: 'sepolia',
    privateKey: '0xinvalidprivatekey',
    rpcUrl: 'https://invalid-rpc-url'
  };

  console.log('Test 1: Deploy with valid config');
  try {
    const contract = await deployContract(validConfig, 'Counter', '../../out/Counter.sol/Counter.json');
    console.log('Deployment successful:', contract.target);
  } catch (error: any) {
    console.error('Deployment failed:', error.message || error);
  }

  console.log('Test 2: Deploy with invalid config');
  try {
    await deployContract(invalidConfig, 'Counter', './out/Counter.sol/Counter.json');
    console.error('Deployment should have failed but did not');
  } catch (error: any) {
    console.log('Properly caught deployment failure:', error.message);
  }
}

runTests().catch(console.error);
