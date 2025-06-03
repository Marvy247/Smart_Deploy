import { ShieldCheckIcon, ExclamationTriangleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface Vulnerability {
  severity: 'high' | 'medium' | 'low' | 'informational'
  description: string
  impact: string
  confidence: string
}

interface VulnerabilityCounts {
  high: number
  medium: number
  low: number
  informational: number
  total: number
}

interface SlitherResult {
  vulnerabilities: number | VulnerabilityCounts
  warnings: number
  optimizations: number
  score: number
  reportUrl?: string
  lastRun: Date
  detectorStats?: Record<string, number>
}

interface SecurityStatusProps {
  slither: SlitherResult
}

export default function SecurityStatus({ slither }: SecurityStatusProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Security Analysis</h3>
        {(typeof slither.vulnerabilities === 'number' ? slither.vulnerabilities === 0 : slither.vulnerabilities.total === 0) ? (
          <span className="inline-flex items-center text-green-600">
            <ShieldCheckIcon className="h-5 w-5 mr-1" />
            Secure
          </span>
        ) : (
          <span className="inline-flex items-center text-red-600">
            <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
            {typeof slither.vulnerabilities === 'number' ? slither.vulnerabilities : slither.vulnerabilities.total} issue{slither.vulnerabilities !== 1 && (typeof slither.vulnerabilities !== 'object' || slither.vulnerabilities.total !== 1) ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-medium text-red-600">
            {typeof slither.vulnerabilities === 'number' ? 0 : slither.vulnerabilities.high}
          </div>
          <div className="text-sm text-gray-500">High</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-orange-500">
            {typeof slither.vulnerabilities === 'number' ? 0 : slither.vulnerabilities.medium}
          </div>
          <div className="text-sm text-gray-500">Medium</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-yellow-500">
            {typeof slither.vulnerabilities === 'number' ? 0 : slither.vulnerabilities.low}
          </div>
          <div className="text-sm text-gray-500">Low</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-blue-500">
            {typeof slither.vulnerabilities === 'number' ? 0 : slither.vulnerabilities.informational}
          </div>
          <div className="text-sm text-gray-500">Info</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-medium">{slither.warnings}</div>
          <div className="text-sm text-gray-500">Warnings</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-medium">{slither.optimizations}</div>
          <div className="text-sm text-gray-500">Optimizations</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-medium">{slither.score}/10</div>
          <div className="text-sm text-gray-500">Score</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <span>Last run: {slither.lastRun.toLocaleString()}</span>
          {slither.detectorStats && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {Object.keys(slither.detectorStats).length} detectors
            </span>
          )}
        </div>
        {slither.reportUrl && (
          <a
            href={slither.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            View Full Report
            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
          </a>
        )}
      </div>
    </div>
  )
}
