import { WebSocketProvider, Contract } from 'ethers';

export interface EventMonitorConfig {
  network: string;
  rpcUrl: string;
  contractAddress: string;
  contractAbi: any;
}

export class EventMonitor {
  private provider: WebSocketProvider;
  private contract: Contract;

  constructor(
    private config: EventMonitorConfig,
    provider?: WebSocketProvider,
    contract?: Contract
  ) {
    this.provider = provider ?? new WebSocketProvider(config.rpcUrl);
    this.contract = contract ?? new Contract(config.contractAddress, config.contractAbi, this.provider);
  }

  public startListening() {
    console.log(`🔔 Starting event monitoring for contract at ${this.config.contractAddress} on network ${this.config.network}`);

    this.contract.on('*', (...args) => {
      console.log(`Event received: ${args}`);
    });

    // WebSocket property is private in ethers v6, use _websocket with caution
    if ((this.provider as any)._websocket && (this.provider as any)._websocket.on) {
      (this.provider as any)._websocket.on('close', (code: number) => {
        console.warn(`⚠️ WebSocket closed with code ${code}. Attempting to reconnect...`);
        setTimeout(() => {
          this.provider = new WebSocketProvider(this.config.rpcUrl);
          this.contract = new Contract(this.config.contractAddress, this.config.contractAbi, this.provider);
          this.startListening();
        }, 5000);
      });
    }
  }

  public stopListening() {
    this.contract.removeAllListeners();
    this.provider.destroy();
    console.log(`🛑 Stopped event monitoring for contract at ${this.config.contractAddress}`);
  }
}
