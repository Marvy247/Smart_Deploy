export const getNetworkConfig = jest.fn().mockImplementation((network: string, config?: string) => ({
  rpcUrl: config ? JSON.parse(config).rpcUrl : `https://${network}.rpc`,
  chainId: 1,
  explorerUrl: `https://${network}.explorer`
}));
