import Layout from '@/components/layout/Layout'
import { NextPage } from 'next'

const SecurityPage: NextPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Security</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-700">
            Security features and settings will be displayed here.
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default SecurityPage
