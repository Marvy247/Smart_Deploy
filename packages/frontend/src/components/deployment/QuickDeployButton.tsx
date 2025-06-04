import { useState } from 'react'
import { Button } from '@tremor/react'
import { NetworkConfig } from '../../types/deployment'

interface QuickDeployButtonProps {
  contractName: string
  network: NetworkConfig
  onDeploy: () => Promise<void>
  isDeploying?: boolean
  disabled?: boolean
}

export default function QuickDeployButton({
  contractName,
  network,
  onDeploy,
  isDeploying = false,
  disabled = false
}: QuickDeployButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeploy = async () => {
    try {
      setShowConfirm(false)
      await onDeploy()
    } catch (error) {
      console.error('Deployment failed:', error)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          color="red"
          onClick={() => setShowConfirm(false)}
          disabled={isDeploying}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          color="green"
          onClick={handleDeploy}
          loading={isDeploying}
          disabled={disabled}
        >
          Confirm Deploy to {network.name}
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      color="blue"
      onClick={() => setShowConfirm(true)}
      disabled={disabled}
    >
      Quick Deploy
    </Button>
  )
}
