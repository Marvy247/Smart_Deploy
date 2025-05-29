import { JsonRpcProvider, Wallet, ContractFactory, Contract, BaseContract } from 'ethers';
import fs from 'fs';
import path from 'path';

import { verifyContract, checkVerificationStatus } from './verify';
import { EventMonitor } from './eventMonitor';

export interface DeploymentConfig {
  network: string;
  privateKey: string;
  rpcUrl: string;
  etherscanApiKey?: string;
}

export async function deployContract(
  config: DeploymentConfig,
  contractName: string,
  contractArtifactPath: string,
  compilerVersion: string = 'v0.8.17+commit.8df45f5f',
  optimizationUsed: number = 1,
  runs: number = 200
): Promise<BaseContract> {
  const provider = new JsonRpcProvider(config.rpcUrl);
  const wallet = new Wallet(config.privateKey, provider);

  const artifact = JSON.parse(fs.readFileSync(path.resolve(contractArtifactPath), 'utf-8'));
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log(`🚀 Starting deployment of ${contractName} to network ${config.network}...`);

  let contract: BaseContract;
  try {
    contract = await factory.deploy();
    console.log(`⏳ Waiting for ${contractName} deployment to be mined...`);
    await contract.waitForDeployment();
  } catch (error) {
    console.error(`❌ Deployment of ${contractName} failed:`, error);
    throw error;
  }

  console.log(`✅ ${contractName} deployed successfully at address: ${contract.target}`);

  if (config.etherscanApiKey) {
    console.log(`🔍 Starting verification of ${contractName} on Etherscan...`);
    try {
      const sourceCode = fs.readFileSync(path.resolve(contractArtifactPath), 'utf-8');
      const guid = await verifyContract({
        apiKey: config.etherscanApiKey,
        network: config.network,
        contractAddress: contract.target.toString(),
        sourceCode,
        contractName,
        compilerVersion,
        optimizationUsed,
        runs,
      });
      console.log(`🕒 Verification submitted. GUID: ${guid}`);

      // Poll verification status until success or failure
      let status = 'Pending';
      while (status === 'Pending') {
        try {
          status = await checkVerificationStatus(config.etherscanApiKey!, config.network, guid);
          console.log(`🔄 Verification status: ${status}`);
          if (status === 'Verification successful') {
            console.log(`✅ Contract ${contractName} verified successfully on Etherscan.`);
            break;
          } else if (status !== 'Pending') {
            console.warn(`⚠️ Verification ended with status: ${status}`);
            break;
          }
          // Wait before polling again
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } catch (pollError) {
          console.error(`⚠️ Error checking verification status:`, pollError);
          break;
        }
      }
    } catch (verificationError) {
      console.error(`⚠️ Verification failed:`, verificationError);
    }
  } else {
    console.log('⚠️ No Etherscan API key provided. Skipping verification.');
  }

  // Start event monitoring after deployment
  const eventMonitor = new EventMonitor({
    network: config.network,
    rpcUrl: config.rpcUrl,
    contractAddress: contract.target.toString(),
    contractAbi: artifact.abi,
  });
  eventMonitor.startListening();

  return contract;
}
