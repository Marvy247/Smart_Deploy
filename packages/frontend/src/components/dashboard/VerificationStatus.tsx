import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

type VerificationStatusProps = {
  sourcify: boolean
  etherscan: boolean
  lastChecked: Date
}

export default function VerificationStatus({ sourcify, etherscan, lastChecked }: VerificationStatusProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <span className="font-medium">Verification:</span>
        {sourcify && etherscan ? (
          <span className="inline-flex items-center text-green-600">
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            Verified
          </span>
        ) : !sourcify && !etherscan ? (
          <span className="inline-flex items-center text-red-600">
            <XCircleIcon className="h-5 w-5 mr-1" />
            Failed
          </span>
        ) : (
          <span className="inline-flex items-center text-yellow-600">
            <ClockIcon className="h-5 w-5 mr-1" />
            Pending
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500">
        Last checked: {lastChecked.toLocaleString()}
      </div>
    </div>
  )
}
