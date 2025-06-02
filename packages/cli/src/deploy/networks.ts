import { NetworkConfig } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Gets network configuration for specified network
 * @param network - Network name (e.g. 'mainnet', 'goerli')
 * @param configPath - Path to configuration file
 * @returns NetworkConfig object
 * @throws Error if config file or network not found
 */
export function getNetworkConfig(network: string, configPath?: string): NetworkConfig {
  const defaultConfigPath = path.resolve(process.cwd(), configPath || './deploy.config.json');
  
  if (!fs.existsSync(defaultConfigPath)) {
    throw new Error(`Configuration file not found at ${defaultConfigPath}`);
  }

  const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
  const networkConfig = config.networks?.[network];

  if (!networkConfig) {
    throw new Error(`Network configuration not found for ${network}`);
  }

  return {
    rpcUrl: networkConfig.rpcUrl,
    chainId: networkConfig.chainId,
    explorerUrl: networkConfig.explorerUrl,
    privateKey: process.env.PRIVATE_KEY || networkConfig.privateKey,
    verify: networkConfig.verify !== false
  };
}

/**
 * Validates network configuration
 * @param config - NetworkConfig to validate
 * @throws Error if config is invalid
 */
export function validateNetworkConfig(config: NetworkConfig): void {
  if (!config.rpcUrl) {
    throw new Error('Missing required RPC URL in network config');
  }
  if (!config.chainId) {
    throw new Error('Missing required chainId in network config');
  }
}
