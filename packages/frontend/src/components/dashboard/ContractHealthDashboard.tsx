import { ContractHealthMetrics } from '../../types/contractHealth'
import { Card, Text, Title, ProgressBar, Badge } from '@tremor/react'

import { ContractHealthLoadingSkeleton } from './ContractHealthLoadingSkeleton'

interface ContractHealthDashboardProps {
  metrics: ContractHealthMetrics
  isLoading?: boolean
  error?: string
}

export default function ContractHealthDashboard({ 
  metrics, 
  isLoading, 
  error 
}: ContractHealthDashboardProps) {
  if (isLoading) {
    return <ContractHealthLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <h3 className="text-lg font-medium">Error loading contract health data</h3>
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

  return (
    <div className="space-y-6">
      <Title>Contract Health Overview</Title>
      
      {/* Contract Size Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Contract Size</Text>
            <Badge color={getSizeStatus(metrics.contractSize.current, metrics.contractSize.limit)}>
              {((metrics.contractSize.current / metrics.contractSize.limit) * 100).toFixed(1)}% of limit
            </Badge>
          </div>
          <ProgressBar
            value={(metrics.contractSize.current / metrics.contractSize.limit) * 100}
            color={getSizeStatus(metrics.contractSize.current, metrics.contractSize.limit)}
          />
          {metrics.contractSize.recommendation && (
            <Text className="text-sm text-gray-500">{metrics.contractSize.recommendation}</Text>
          )}
        </div>
      </Card>

      {/* Gas Efficiency Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Gas Efficiency Score</Text>
            <Badge color={metrics.gasEfficiency.score > 80 ? 'green' : 'yellow'}>
              {metrics.gasEfficiency.score}/100
            </Badge>
          </div>
          <ProgressBar value={metrics.gasEfficiency.score} color="blue" />
          
          {metrics.gasEfficiency.suggestions.length > 0 && (
            <div className="mt-4">
              <Text className="font-medium mb-2">Optimization Suggestions</Text>
              <div className="space-y-2">
                {metrics.gasEfficiency.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-2">
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
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Test Coverage Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Test Coverage</Text>
            <Badge color={metrics.testCoverage.percentage > 80 ? 'green' : 'yellow'}>
              {metrics.testCoverage.percentage}% covered
            </Badge>
          </div>
          <ProgressBar value={metrics.testCoverage.percentage} color="green" />
          
          {metrics.testCoverage.criticalFunctions.length > 0 && (
            <div className="mt-4">
              <Text className="font-medium text-red-600">
                {metrics.testCoverage.uncoveredLines} uncovered lines in critical functions:
              </Text>
              <div className="mt-2 space-y-1">
                {metrics.testCoverage.criticalFunctions.map((func, index) => (
                  <Text key={index} className="text-sm text-gray-600">• {func}</Text>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Deployment Costs Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text>Estimated Deployment Cost</Text>
            <Text className="font-medium">{metrics.deploymentCosts.estimated}</Text>
          </div>
          
          {metrics.deploymentCosts.historical.length > 0 && (
            <div className="mt-4">
              <Text className="font-medium mb-2">Historical Deployment Costs</Text>
              <div className="space-y-2">
                {metrics.deploymentCosts.historical.map((deployment, index) => (
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
