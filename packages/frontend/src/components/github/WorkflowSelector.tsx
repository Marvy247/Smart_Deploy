import React, { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useGitHubAPI } from '../../services/github'
import { Workflow } from '../../services/github'

interface WorkflowSelectorProps {
  repoFullName: string | null
  onSelect: (workflow: Workflow) => void
}

export default function WorkflowSelector({ repoFullName, onSelect }: WorkflowSelectorProps) {
  const { fetchWorkflows } = useGitHubAPI()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (repoFullName) {
      loadWorkflows(repoFullName)
    } else {
      setWorkflows([])
      setSelectedWorkflow(null)
    }
  }, [repoFullName])

  const loadWorkflows = async (fullName: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchWorkflows(fullName)
      setWorkflows(data)
    } catch (err) {
      setError('Failed to load workflows')
      console.error('Error fetching workflows:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    onSelect(workflow)
    setIsOpen(false)
  }

  return (
    <div className="relative mt-4">
      <button
        type="button"
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        disabled={!repoFullName || loading}
      >
        <span className="block truncate">
          {selectedWorkflow ? selectedWorkflow.name : 'Select a workflow'}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {loading ? (
            <li className="text-gray-500 py-2 pl-3 pr-9 text-sm">Loading workflows...</li>
          ) : error ? (
            <li className="text-red-500 py-2 pl-3 pr-9 text-sm">{error}</li>
          ) : workflows.length === 0 ? (
            <li className="text-gray-500 py-2 pl-3 pr-9 text-sm">
              {repoFullName ? 'No workflows found' : 'Select a repository first'}
            </li>
          ) : (
            workflows.map((workflow) => (
              <li
                key={workflow.id}
                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                onClick={() => handleSelect(workflow)}
              >
                <div className="flex items-center">
                  <span className="font-normal block truncate">{workflow.name}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
