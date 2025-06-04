import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'

interface SecurityScoreRadialChartProps {
  score: number
}

export default function SecurityScoreRadialChart({ score }: SecurityScoreRadialChartProps) {
  const data = [
    {
      name: 'Score',
      value: score,
      fill: score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444'
    }
  ]

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 10]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            fill={data[0].fill}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold"
            fill={data[0].fill}
          >
            {score}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}
