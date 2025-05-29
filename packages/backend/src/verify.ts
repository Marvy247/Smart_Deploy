import axios from 'axios';

export interface VerificationConfig {
  apiKey: string;
  network: string;
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  optimizationUsed: number;
  runs: number;
  constructorArguments?: string;
}

const ETHERSCAN_API_URLS: Record<string, string> = {
  mainnet: 'https://api.etherscan.io/api',
  sepolia: 'https://api-sepolia.etherscan.io/api',
  // Add other networks as needed
};

export async function verifyContract(config: VerificationConfig): Promise<string> {
  const apiUrl = ETHERSCAN_API_URLS[config.network];
  if (!apiUrl) {
    throw new Error(`Unsupported network for verification: ${config.network}`);
  }

  const params = {
    apikey: config.apiKey,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: config.contractAddress,
    sourceCode: config.sourceCode,
    contractname: config.contractName,
    compilerversion: config.compilerVersion,
    optimizationUsed: config.optimizationUsed,
    runs: config.runs,
    constructorArguements: config.constructorArguments || '',
  };

  try {
    const response = await axios.post(apiUrl, null, { params });
    if (response.data.status !== '1') {
      throw new Error(`Verification failed: ${response.data.result}`);
    }
    return response.data.result; // This is the GUID for verification status
  } catch (error: any) {
    throw new Error(`Verification request error: ${error.message}`);
  }
}

export async function checkVerificationStatus(apiKey: string, network: string, guid: string): Promise<string> {
  const apiUrl = ETHERSCAN_API_URLS[network];
  if (!apiUrl) {
    throw new Error(`Unsupported network for verification status check: ${network}`);
  }

  const params = {
    apikey: apiKey,
    module: 'contract',
    action: 'checkverifystatus',
    guid,
  };

  try {
    const response = await axios.get(apiUrl, { params });
    if (response.data.status !== '1') {
      return response.data.result; // Pending or failure message
    }
    return 'Verification successful';
  } catch (error: any) {
    throw new Error(`Verification status check error: ${error.message}`);
  }
}
