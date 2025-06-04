import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GasUsageChartProps {
  deployments: Array<{
    contractName: string
    network: string
    address: string
    deployer: string
    timestamp: Date
    txHash: string
    gasUsed: string
  }>
}

export default function GasUsageChart({ deployments }: GasUsageChartProps) {
  const data = deployments.map(d => ({
    name: d.contractName,
    gasUsed: parseInt(d.gasUsed.replace(/,/g, '')),
    date: d.timestamp.toLocaleDateString()
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Gas Used', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="gasUsed"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="Gas Usage"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
