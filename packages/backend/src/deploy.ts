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

  console.log(`Deploying ${contractName} to network ${config.network}...`);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log(`${contractName} deployed at address: ${contract.target}`);
  return contract;
}
