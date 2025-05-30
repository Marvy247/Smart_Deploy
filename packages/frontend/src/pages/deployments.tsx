import React, { useState, useEffect } from 'react';

interface Deployment {
  id: string;
  contractName: string;
  network: string;
  deployer: string;
  gasUsed: number;
  txHash: string;
  timestamp: string;
}

const mockDeployments: Deployment[] = [
  {
    id: '1',
    contractName: 'MyToken',
    network: 'rinkeby',
    deployer: '0x1234...abcd',
    gasUsed: 21000,
    txHash: '0xabc123...',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    contractName: 'MyNFT',
    network: 'mainnet',
    deployer: '0x5678...efgh',
    gasUsed: 45000,
    txHash: '0xdef456...',
    timestamp: new Date().toISOString(),
  },
];

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [contractName, setContractName] = useState('');
  const [network, setNetwork] = useState('');
  const [githubTag, setGithubTag] = useState('');

  const handleDeploy = () => {
    alert(`Deploying contract ${contractName} on network ${network} with GitHub tag ${githubTag}`);
  };

  const handleRollback = (deploymentId: string) => {
    alert(`Rolling back deployment ${deploymentId}`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading deployments...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Deployments</h1>

      <section className="mb-8 p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Deploy New Contract</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block font-medium mb-1">Contract Name</label>
            <input
              type="text"
              value={contractName}
              onChange={e => setContractName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. MyToken"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Network</label>
            <input
              type="text"
              value={network}
              onChange={e => setNetwork(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. mainnet, rinkeby"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">GitHub Tag/Commit</label>
            <input
              type="text"
              value={githubTag}
              onChange={e => setGithubTag(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. v1.0.0"
            />
          </div>
          <button
            onClick={handleDeploy}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Deploy
          </button>
        </div>
      </section>

      <section className="p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Deployment History</h2>
        {deployments.length === 0 ? (
          <p>No deployments found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Contract Name</th>
                <th className="border px-3 py-2 text-left">Network</th>
                <th className="border px-3 py-2 text-left">Deployer</th>
                <th className="border px-3 py-2 text-right">Gas Used</th>
                <th className="border px-3 py-2 text-left">Tx Hash</th>
                <th className="border px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map(deployment => (
                <tr key={deployment.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{deployment.contractName}</td>
                  <td className="border px-3 py-2">{deployment.network}</td>
                  <td className="border px-3 py-2">{deployment.deployer}</td>
                  <td className="border px-3 py-2 text-right">{deployment.gasUsed.toLocaleString()}</td>
                  <td className="border px-3 py-2 break-all">{deployment.txHash}</td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => handleRollback(deployment.id)}
                      className="text-red-600 hover:underline"
                    >
                      Rollback / Redeploy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
