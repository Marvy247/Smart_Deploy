import { useProjects } from '@/hooks/useProjects'
import DeploymentCard from '@/components/dashboard/DeploymentCard'
import DeploymentSummaryCard from '@/components/dashboard/DeploymentSummaryCard'
import CIStatusBadge from '@/components/dashboard/CIStatusBadge'
import TestResultsSummary from '@/components/dashboard/TestResultsSummary'
import EventsViewer from '@/components/dashboard/EventsViewer'
import TransactionChart from '@/components/metrics/TransactionChart'
import { Project } from '@/types/project'

export default function DashboardPage() {
  const { projects = [], loading: isLoading, error } = useProjects()

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600 font-semibold">Error loading projects</div>
  }

  const firstProject = projects[0]

  // Transform project transactions to match TransactionChart expected format
  const chartData = firstProject?.transactions?.map(tx => ({
    date: tx.timestamp,
    count: tx.value,
    gasUsed: tx.value * 1000 // Example conversion
  })) || []

  // For demo, mock deployment count and last deployed date
  const deploymentCount = 5
  const lastDeployedAt = firstProject?.lastDeployedAt

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 p-8 font-sans text-white">
      <h1 className="text-5xl font-extrabold mb-12 text-center drop-shadow-lg">Dashboard</h1>
      
      {isLoading ? (
        <p className="text-center text-lg text-gray-300">Loading projects...</p>
      ) : !projects.length ? (
        <p className="text-center text-lg text-gray-300">No projects found</p>
      ) : (
        <div className="space-y-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {projects.map((project: Project) => (
              <DeploymentCard key={project.id.toString()} project={project} />
            ))}
            <DeploymentSummaryCard deploymentCount={deploymentCount} lastDeployedAt={lastDeployedAt} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6 bg-gray-800 p-6 rounded-xl shadow-xl">
              <h2 className="text-3xl font-semibold mb-4">CI Status</h2>
              <CIStatusBadge status={firstProject?.status} jobUrl={firstProject?.ciJobUrl} />
            </div>

            <div className="space-y-6 bg-gray-800 p-6 rounded-xl shadow-xl">
              <h2 className="text-3xl font-semibold mb-4">Test Results</h2>
              <TestResultsSummary 
                fuzzTestsPassed={firstProject?.fuzzTestsPassed ?? false} 
                invariantTestsPassed={firstProject?.invariantTestsPassed ?? false} 
              />
              <div className="mt-6">
                <TransactionChart transactions={chartData} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
            <h2 className="text-3xl font-semibold mb-4">Recent Events</h2>
            <EventsViewer events={firstProject?.events || []} />
          </div>
        </div>
      )}
    </div>
  )
}
