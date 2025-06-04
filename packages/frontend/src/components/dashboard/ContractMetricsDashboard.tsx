import { ContractHealthMetrics } from '../../types/contractHealth'
import { Card, Text, Title, ProgressBar, Badge, AreaChart } from '@tremor/react'
import { ContractHealthLoadingSkeleton } from './ContractHealthLoadingSkeleton'

interface ContractMetricsDashboardProps {
  metrics: {
    health: ContractHealthMetrics
    analysis: {
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
  isLoading?: boolean
  error?: string
}

export default function ContractMetricsDashboard({ 
  metrics, 
  isLoading, 
  error 
}: ContractMetricsDashboardProps) {
  if (isLoading) {
    return <ContractHealthLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <h3 className="text-lg font-medium">Error loading contract metrics</h3>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    )
  }

  const getSizeStatus = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage < 50) return 'green'
    if (percentage < 80) return 'yellow'
    return 'red'
  }

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'red'
      case 'medium':
        return 'yellow'
      case 'low':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getComplexityStatus = (score: number) => {
    if (score < 30) return 'green'
    if (score < 70) return 'yellow'
    return 'red'
  }

  return (
    <div className="space-y-6">
      <Title>Contract Metrics Overview</Title>
      
      {/* Combined Size Metrics */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Contract Size</Text>
            <div className="flex space-x-4">
              <Badge color={getSizeStatus(metrics.health.contractSize.current, metrics.health.contractSize.limit)}>
                {((metrics.health.contractSize.current / metrics.health.contractSize.limit) * 100).toFixed(1)}% of limit
              </Badge>
              <Badge color={getSizeStatus(metrics.analysis.size.bytecode, 24576)}>
                {((metrics.analysis.size.bytecode / 24576) * 100).toFixed(1)}% bytecode
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <ProgressBar
              value={(metrics.health.contractSize.current / metrics.health.contractSize.limit) * 100}
              color={getSizeStatus(metrics.health.contractSize.current, metrics.health.contractSize.limit)}
            />
            <ProgressBar
              value={(metrics.analysis.size.bytecode / 24576) * 100}
              color={getSizeStatus(metrics.analysis.size.bytecode, 24576)}
            />
          </div>
          {metrics.health.contractSize.recommendation && (
            <Text className="text-sm text-gray-500">{metrics.health.contractSize.recommendation}</Text>
          )}
        </div>
      </Card>

      {/* Combined Gas Metrics */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Gas Efficiency</Text>
            <Badge color={metrics.health.gasEfficiency.score > 80 ? 'green' : 'yellow'}>
              {metrics.health.gasEfficiency.score}/100
            </Badge>
          </div>
          <ProgressBar value={metrics.health.gasEfficiency.score} color="blue" />
          
          <div className="h-60 mt-4">
            <AreaChart
              data={metrics.analysis.gasAnalysis.methodCosts.map(method => ({
                name: method.name,
                'Gas Cost': method.cost,
              }))}
              index="name"
              categories={['Gas Cost']}
              colors={['blue']}
              valueFormatter={(value) => `${value.toLocaleString()} gas`}
            />
          </div>

          {(metrics.health.gasEfficiency.suggestions.length > 0 || 
            metrics.analysis.gasAnalysis.methodCosts.some(m => m.optimization)) && (
            <div className="mt-4">
              <Text className="font-medium mb-2">Optimization Suggestions</Text>
              <div className="space-y-2">
                {metrics.health.gasEfficiency.suggestions.map((suggestion, index) => (
                  <div key={`health-${index}`} className="flex items-start space-x-2">
                    <Badge color={getImpactColor(suggestion.impact)} className="mt-1">
                      {suggestion.impact}
                    </Badge>
                    <div>
                      <Text className="font-medium">{suggestion.type}</Text>
                      <Text className="text-sm text-gray-500">{suggestion.description}</Text>
                      {suggestion.potentialSavings && (
                        <Text className="text-sm text-green-600">
                          Potential savings: {suggestion.potentialSavings}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
                {metrics.analysis.gasAnalysis.methodCosts
                  .filter(method => method.optimization)
                  .map((method, index) => (
                    <div key={`analysis-${index}`} className="bg-blue-50 p-3 rounded-lg">
                      <Text className="font-medium">{method.name}</Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        {method.optimization}
                      </Text>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Complexity Score */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Complexity Score</Text>
            <Badge color={getComplexityStatus(metrics.analysis.complexityScore)}>
              {metrics.analysis.complexityScore < 30 ? 'Low' : 
               metrics.analysis.complexityScore < 70 ? 'Medium' : 'High'} Complexity
            </Badge>
          </div>
          <ProgressBar
            value={metrics.analysis.complexityScore}
            color={getComplexityStatus(metrics.analysis.complexityScore)}
          />
        </div>
      </Card>

      {/* Test Coverage */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Test Coverage</Text>
            <Badge color={metrics.health.testCoverage.percentage > 80 ? 'green' : 'yellow'}>
              {metrics.health.testCoverage.percentage}% covered
            </Badge>
          </div>
          <ProgressBar value={metrics.health.testCoverage.percentage} color="green" />
          
          {metrics.health.testCoverage.criticalFunctions.length > 0 && (
            <div className="mt-4">
              <Text className="font-medium text-red-600">
                {metrics.health.testCoverage.uncoveredLines} uncovered lines in critical functions:
              </Text>
              <div className="mt-2 space-y-1">
                {metrics.health.testCoverage.criticalFunctions.map((func, index) => (
                  <Text key={index} className="text-sm text-gray-600">• {func}</Text>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Deployment Costs */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Estimated Deployment Cost</Text>
            <Text className="font-medium">{metrics.health.deploymentCosts.estimated}</Text>
          </div>
          
          {metrics.health.deploymentCosts.historical.length > 0 && (
            <div className="mt-4">
              <Text className="font-medium mb-2">Historical Deployment Costs</Text>
              <div className="space-y-2">
                {metrics.health.deploymentCosts.historical.map((deployment, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge color="gray">{deployment.network}</Badge>
                      <Text>{new Date(deployment.date).toLocaleDateString()}</Text>
                    </div>
                    <Text className="font-medium">{deployment.cost}</Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
