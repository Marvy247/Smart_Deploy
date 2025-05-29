import { expect } from 'chai';
import { EventMonitor, EventMonitorConfig } from './eventMonitor';
import { ethers } from 'ethers';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';

chai.use(sinonChai);

describe('EventMonitor', () => {
  let eventMonitor: EventMonitor;
  let config: EventMonitorConfig;
  let providerStub: sinon.SinonStubbedInstance<any>;
  let contractStub: any;

  beforeEach(() => {
    config = {
      network: 'sepolia',
      rpcUrl: 'wss://sepolia.infura.io/ws/v3/test',
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
      contractAbi: [],
    };

    // Stub provider and contract
    providerStub = {
      websocket: {
        on: sinon.stub(),
      },
      destroy: sinon.stub(),
    };
    contractStub = {
      on: sinon.stub(),
      removeAllListeners: sinon.stub(),
    };

    // Spy on WebSocketProvider constructor
    const wsProviderSpy = sinon.spy(() => providerStub);

    eventMonitor = new EventMonitor(config, wsProviderSpy() as any, contractStub);
    // Attach spy for later assertions
    (eventMonitor as any)._wsProviderSpy = wsProviderSpy;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should start listening to contract events', () => {
    eventMonitor.startListening();
    // Manually trigger the event handler to simulate event
    expect(contractStub.on.called).to.be.true;
  });

  it('should stop listening to contract events', () => {
    eventMonitor.stopListening();
    expect(contractStub.removeAllListeners.called).to.be.true;
    expect(providerStub.destroy.called).to.be.true;
  });

  it('should attempt to reconnect on websocket close', () => {
    const clock = sinon.useFakeTimers();
    eventMonitor.startListening();

    // Simulate websocket close event
    const websocket = (providerStub as any).websocket;
    if (websocket && websocket.on.called) {
      const closeHandler = websocket.on.getCalls().find((call: any) => call.args[0] === 'close')?.args[1];
      if (closeHandler) {
        closeHandler(1006);
      }
    }

    clock.tick(5000); // advance time to trigger reconnect

    expect((eventMonitor as any)._wsProviderSpy.callCount).to.be.gte(1);
    expect(sinon.stub(ethers, 'Contract')).to.have.been.calledTwice;

    clock.restore();
  });
});
