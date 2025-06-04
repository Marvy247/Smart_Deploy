import { Card, Text, Title, ProgressBar, Badge, AreaChart } from '@tremor/react'

interface ContractAnalysisProps {
  metrics: {
    size: {
      bytecode: number
      deployedBytecode: number
      sourceLines: number
    }
    gasAnalysis: {
      deploymentCost: number
      methodCosts: Array<{
        name: string
        cost: number
        optimization?: string
      }>
    }
    complexityScore: number
  }
}

export default function ContractAnalysisCard({ metrics }: ContractAnalysisProps) {
  const EIP170_LIMIT = 24576 // 24KB contract size limit
  const sizePercentage = (metrics.size.bytecode / EIP170_LIMIT) * 100

  const getSizeStatus = () => {
    if (sizePercentage < 50) return 'green'
    if (sizePercentage < 80) return 'yellow'
    return 'red'
  }

  const getComplexityStatus = () => {
    if (metrics.complexityScore < 30) return 'green'
    if (metrics.complexityScore < 70) return 'yellow'
    return 'red'
  }

  // Format gas costs for chart
  const gasData = metrics.gasAnalysis.methodCosts.map(method => ({
    name: method.name,
    'Gas Cost': method.cost,
  }))

  return (
    <Card>
      <Title>Contract Analysis</Title>
      
      {/* Size Metrics */}
      <div className="mt-6">
        <Text>Contract Size</Text>
        <div className="flex items-center justify-between mt-2">
          <Text>{(metrics.size.bytecode / 1024).toFixed(2)}KB</Text>
          <Badge color={getSizeStatus()}>
            {sizePercentage.toFixed(1)}% of limit
          </Badge>
        </div>
        <ProgressBar
          value={sizePercentage}
          color={getSizeStatus()}
          className="mt-2"
        />
      </div>

      {/* Complexity Score */}
      <div className="mt-6">
        <Text>Complexity Score</Text>
        <div className="flex items-center justify-between mt-2">
          <Text>{metrics.complexityScore}/100</Text>
          <Badge color={getComplexityStatus()}>
            {metrics.complexityScore < 30 ? 'Low' : 
             metrics.complexityScore < 70 ? 'Medium' : 'High'} Complexity
          </Badge>
        </div>
        <ProgressBar
          value={metrics.complexityScore}
          color={getComplexityStatus()}
          className="mt-2"
        />
      </div>

      {/* Gas Analysis */}
      <div className="mt-6">
        <Text>Gas Usage by Method</Text>
        <div className="h-60 mt-4">
          <AreaChart
            data={gasData}
            index="name"
            categories={['Gas Cost']}
            colors={['blue']}
            valueFormatter={(value) => `${value.toLocaleString()} gas`}
          />
        </div>
      </div>

      {/* Optimization Suggestions */}
      {metrics.gasAnalysis.methodCosts.some(m => m.optimization) && (
        <div className="mt-6">
          <Text className="font-medium">Optimization Suggestions</Text>
          <div className="space-y-2 mt-2">
            {metrics.gasAnalysis.methodCosts
              .filter(method => method.optimization)
              .map((method, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg">
                  <Text className="font-medium">{method.name}</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {method.optimization}
                  </Text>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  )
}
