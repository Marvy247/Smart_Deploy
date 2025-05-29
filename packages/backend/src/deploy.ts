import { JsonRpcProvider, Wallet, ContractFactory, Contract, BaseContract } from 'ethers';
import fs from 'fs';
import path from 'path';

export interface DeploymentConfig {
  network: string;
  privateKey: string;
  rpcUrl: string;
}

export async function deployContract(
  config: DeploymentConfig,
  contractName: string,
  contractArtifactPath: string
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

  // Additional status tracking could be added here, e.g., emitting events or updating a status store

  return contract;
}
