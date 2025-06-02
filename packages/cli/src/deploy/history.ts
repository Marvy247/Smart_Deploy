import fs from 'fs';
import path from 'path';
import { DeploymentResult, DeploymentStatus } from './types';

const HISTORY_FILE = 'deployments.json';

interface DeploymentRecord extends DeploymentResult {
  contractName: string;
  network: string;
  previousDeploymentId?: string;
  artifacts: {
    abi: string;
    bytecode: string;
    source: string;
  };
  rollbackReason?: string;
  rolledBackTo?: string;
  rolledBackFrom?: string;
}

class DeploymentHistory {
  private filePath: string;

  constructor() {
    const deploymentsDir = process.env.DEPLOYMENTS_DIR || path.join(process.cwd(), 'deployments');
    this.filePath = path.join(deploymentsDir, HISTORY_FILE);
    this.ensureHistoryFile();
  }


  private ensureHistoryFile(): void {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  async addDeployment(record: DeploymentRecord): Promise<void> {
    const history = this.getHistory();
    history.push(record);
    fs.writeFileSync(this.filePath, JSON.stringify(history, null, 2));
  }

  async getDeployment(deploymentId: string): Promise<DeploymentRecord | undefined> {
    const history = this.getHistory();
    return history.find(d => d.deploymentId === deploymentId);
  }

  async getPreviousVersion(contractName: string, network: string): Promise<DeploymentRecord | undefined> {
    const history = this.getHistory();
    return history
      .filter(d => d.contractName === contractName && d.network === network)
      .sort((a, b) => b.timestamp! - a.timestamp!)
      [0];
  }

  private getHistory(): DeploymentRecord[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data) as DeploymentRecord[];
    } catch (error) {
      return [];
    }
  }

  async markAsRolledBack(
    deploymentId: string,
    details: {
      reason?: string;
      rolledBackTo?: string;
      rolledBackFrom?: string;
    }
  ): Promise<void> {
    const history = this.getHistory();
    const deployment = history.find(d => d.deploymentId === deploymentId);
    if (deployment) {
      deployment.status = 'rolledback';
      deployment.rollbackReason = details.reason;
      deployment.rolledBackTo = details.rolledBackTo;
      deployment.rolledBackFrom = details.rolledBackFrom;
      fs.writeFileSync(this.filePath, JSON.stringify(history, null, 2));
    }
  }
}

export { DeploymentHistory, DeploymentRecord };
