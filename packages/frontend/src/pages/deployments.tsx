import { NextPage } from 'next'
import Layout from '../components/layout/Layout'
import { Deployment } from '../types/deployment'
import { DeploymentsTable } from '../components/dashboard/MemoizedComponents'

const DeploymentsPage: NextPage = () => {
  // TODO: Fetch deployments data
  const deployments: Deployment[] = []

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Deployment History</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <DeploymentsTable deployments={deployments} />
        </div>
      </div>
    </Layout>
  )
}

export default DeploymentsPage
