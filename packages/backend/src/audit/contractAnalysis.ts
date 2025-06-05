import { execSync } from 'child_process';
import fs from 'fs';
import { AuditFinding, AuditSeverity, VulnerabilityType } from './types';

interface ContractMetrics {
  size: {
    bytecode: number;
    deployedBytecode: number;
    sourceLines: number;
  };
  gasAnalysis: {
    deploymentCost: number;
    methodCosts: Array<{
      name: string;
      cost: number;
      optimization?: string;
    }>;
  };
  complexityScore: number;
}

export async function analyzeContract(contractInput: string): Promise<{
  metrics: ContractMetrics;
  findings: AuditFinding[];
}> {
  let sourceCode: string;
  try {
    // Try to read as file path first
    sourceCode = fs.readFileSync(contractInput, 'utf8');
  } catch {
    // If not a file, treat as direct source code
    sourceCode = contractInput;
  }
  const findings: AuditFinding[] = [];
  
  // Analyze contract size
  const sizeMetrics = await getContractSize(sourceCode);
  
  // Check if contract size approaches limits
  if (sizeMetrics.bytecode > 20000) { // Warning at ~80% of limit
    findings.push({
      id: 'size-warning',
      title: 'Contract Size Warning',
      description: `Contract size (${sizeMetrics.bytecode} bytes) is approaching the limit of 24KB`,
      severity: AuditSeverity.MEDIUM,
      type: VulnerabilityType.SIZE_OPTIMIZATION,
      recommendation: 'Consider splitting the contract into smaller contracts or removing unused functions',
      codeSnippet: undefined
    });
  }

  // Analyze gas usage
  const gasAnalysis = await analyzeGasUsage(sourceCode);
  
  // Add findings for expensive operations
  gasAnalysis.methodCosts.forEach(method => {
    if (method.cost > 100000) { // Arbitrary threshold for demonstration
      findings.push({
        id: `gas-${method.name}`,
        title: 'High Gas Usage',
        description: `Method ${method.name} uses significant gas (${method.cost} units)`,
        severity: AuditSeverity.LOW,
        type: VulnerabilityType.GAS_OPTIMIZATION,
        recommendation: method.optimization || 'Consider optimizing the function logic',
        codeSnippet: undefined
      });
    }
  });

  // Calculate complexity score based on various metrics
  const complexityScore = calculateComplexityScore(sourceCode);

  return {
    metrics: {
      size: sizeMetrics,
      gasAnalysis,
      complexityScore
    },
    findings
  };
}

async function getContractSize(sourceCode: string): Promise<{
  bytecode: number;
  deployedBytecode: number;
  sourceLines: number;
}> {
  try {
    // Write source to temp file for solc
    const tempFile = '/tmp/contract.sol';
    fs.writeFileSync(tempFile, sourceCode);
    
    // Get compiled bytecode size using solc
    const output = execSync(`solc --bin ${tempFile}`, {
      encoding: 'utf-8'
    });
    const bytecode = output.length / 2; // Convert hex to bytes

    // Count source lines (excluding comments and empty lines)
    const sourceLines = sourceCode
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('//'))
      .length;

    return {
      bytecode,
      deployedBytecode: Math.floor(bytecode * 0.8), // Approximate deployed size
      sourceLines
    };
  } catch (error) {
    console.error('Error analyzing contract size:', error);
    return {
      bytecode: 0,
      deployedBytecode: 0,
      sourceLines: 0
    };
  }
}

async function analyzeGasUsage(sourceCode: string): Promise<{
  deploymentCost: number;
  methodCosts: Array<{
    name: string;
    cost: number;
    optimization?: string;
  }>;
}> {
  try {
    // Write source to temp file for forge
    const tempFile = '/tmp/contract.sol';
    fs.writeFileSync(tempFile, sourceCode);
    
    // Use hardhat gas reporter or similar tool to get gas estimates
    const output = execSync(`forge test --gas-report ${tempFile}`, {
      encoding: 'utf-8'
    });

    // Parse gas report output (simplified for example)
    const methodCosts = [];
    const lines = output.split('\n');
    let deploymentCost = 0;

    for (const line of lines) {
      if (line.includes('·')) {
        const [name, gasStr] = line.split('·').map(s => s.trim());
        const gas = parseInt(gasStr, 10);
        
        if (name === 'deployment') {
          deploymentCost = gas;
        } else {
          let optimization;
          if (gas > 100000) {
            optimization = 'Consider using batch operations or optimizing loops';
          } else if (line.includes('SSTORE')) {
            optimization = 'Consider packing storage variables';
          }
          
          methodCosts.push({ name, cost: gas, optimization });
        }
      }
    }

    return {
      deploymentCost,
      methodCosts
    };
  } catch (error) {
    console.error('Error analyzing gas usage:', error);
    return {
      deploymentCost: 0,
      methodCosts: []
    };
  }
}

function calculateComplexityScore(sourceCode: string): number {
  let score = 0;
  
  // Count control structures
  const controlStructures = (sourceCode.match(/(if|for|while|do)/g) || []).length;
  score += controlStructures * 2;
  
  // Count state variables
  const stateVars = (sourceCode.match(/^\s*(uint|int|bool|address|string|bytes|mapping)/gm) || []).length;
  score += stateVars;
  
  // Count external calls
  const externalCalls = (sourceCode.match(/(call|delegatecall|staticcall|transfer|send)/g) || []).length;
  score += externalCalls * 3;
  
  return Math.min(100, score); // Normalize to 0-100
}
