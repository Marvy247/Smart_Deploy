import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SecurityMetricsChartProps {
  vulnerabilities: {
    high: number
    medium: number
    low: number
    informational: number
  }
}

export default function SecurityMetricsChart({ vulnerabilities }: SecurityMetricsChartProps) {
  const data = [
    { name: 'High', value: vulnerabilities.high, fill: '#ef4444' },
    { name: 'Medium', value: vulnerabilities.medium, fill: '#f59e0b' },
    { name: 'Low', value: vulnerabilities.low, fill: '#3b82f6' },
    { name: 'Info', value: vulnerabilities.informational, fill: '#9ca3af' }
  ]

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Vulnerabilities">
            {data.map((entry, index) => (
              <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
