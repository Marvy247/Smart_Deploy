import { EventMonitor } from './eventMonitor';
import { AlertConfig } from './alertTypes';
import { WebSocketProvider, Contract, EventLog } from 'ethers';

// Mock WebSocket Provider
class MockProvider {
  _websocket = {
    on: (event: string, callback: (code: number) => void) => {}
  };
  
  destroy() {}
}

// Mock Contract
class MockContract {
  private eventHandlers: Map<string, Function[]> = new Map();

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName)?.push(callback);
  }

  removeAllListeners() {
    this.eventHandlers.clear();
  }

  // Method to simulate events for testing
  simulateEvent(eventName: string, ...args: any[]) {
    const handlers = this.eventHandlers.get('*') || [];
    handlers.forEach(handler => handler(eventName, ...args));
  }
}

// Test configuration
const config = {
  network: 'test',
  rpcUrl: 'ws://mock:8545',
  contractAddress: '0x1234567890123456789012345678901234567890',
  contractAbi: [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ],
  alertConfig: {
    enabled: true,
    rules: [
      {
        eventName: 'Transfer',
        condition: (args: any[]) => true, // Alert on all Transfer events
        emailConfig: {
          from: 'test@example.com',
          to: ['recipient@example.com'],
          subject: 'Transfer Event Alert - ${eventName}',
          body: 'A transfer event occurred with args: ${args}'
        }
      }
    ],
    emailFrom: 'test@example.com',
    smtpConfig: {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'password123'
      }
    }
  }
};

async function testAlertSystem() {
  console.log('🧪 Starting alert system test...');
  
  try {
    // Create mock provider and contract
    const mockProvider = new MockProvider() as unknown as WebSocketProvider;
    const mockContract = new MockContract() as unknown as Contract;
    
    // Create monitor with mocks and enable mock mode for email service
    const configWithMockEmail = {
      ...config,
      alertConfig: {
        ...config.alertConfig,
        smtpConfig: {
          ...config.alertConfig!.smtpConfig,
          mockMode: true  // Enable mock mode
        }
      }
    };
    const monitor = new EventMonitor(configWithMockEmail, mockProvider, mockContract);
    
    // Start monitoring
    monitor.startListening();
    console.log('✅ Event monitoring started successfully');
    
    // Simulate a Transfer event
    console.log('📨 Simulating Transfer event...');
    (mockContract as unknown as MockContract).simulateEvent(
      'Transfer',
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '1000000000000000000'
    );
    
    // Give time for event processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clean up
    monitor.stopListening();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAlertSystem().catch(console.error);
