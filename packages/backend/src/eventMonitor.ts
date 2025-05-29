import { WebSocketProvider, Contract } from 'ethers';
import { AlertConfig, AlertRule } from './alertTypes';
import { EmailService } from './emailService';

export interface EventMonitorConfig {
  network: string;
  rpcUrl: string;
  contractAddress: string;
  contractAbi: any;
  alertConfig?: AlertConfig;
}

export class EventMonitor {
  private provider: WebSocketProvider;
  private contract: Contract;
  private alertConfig?: AlertConfig;
  private emailService?: EmailService;

  constructor(
    private config: EventMonitorConfig,
    provider?: WebSocketProvider,
    contract?: Contract
  ) {
    this.provider = provider ?? new WebSocketProvider(config.rpcUrl);
    this.contract = contract ?? new Contract(config.contractAddress, config.contractAbi, this.provider);
    this.alertConfig = config.alertConfig;
    if (this.alertConfig && this.alertConfig.enabled) {
      this.emailService = new EmailService(this.alertConfig.smtpConfig, this.alertConfig.mockMode);
      this.emailService.verifyConnection().then((ok) => {
        if (!ok) {
          console.warn('⚠️ Email service connection verification failed');
        }
      });
    }
  }

  public startListening() {
    console.log(`🔔 Starting event monitoring for contract at ${this.config.contractAddress} on network ${this.config.network}`);

    this.contract.on('*', async (...args) => {
      console.log(`Event received: ${args}`);

      if (this.alertConfig && this.alertConfig.enabled && this.emailService) {
        for (const rule of this.alertConfig.rules) {
          if (rule.eventName === args[0]) {
            const conditionMet = rule.condition ? rule.condition(args) : true;
            if (conditionMet) {
              try {
                await this.emailService.sendAlert(rule.emailConfig, { eventName: args[0], args });
              } catch (error) {
                console.error('❌ Error sending alert email:', error);
              }
            }
          }
        }
      }
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
