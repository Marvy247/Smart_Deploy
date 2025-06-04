import React, { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useGitHubAuth } from '../../contexts/GitHubAuthContext'
import { useGitHubAPI, Repository } from '../../services/github'

interface RepoSelectorProps {
  onSelect: (repo: Repository) => void
}

export default function RepoSelector({ onSelect }: RepoSelectorProps) {
  const { isAuthenticated, login } = useGitHubAuth()
  const { fetchRepositories } = useGitHubAPI()
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadRepositories()
    }
  }, [isAuthenticated])

  const loadRepositories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRepositories()
      setRepos(data)
    } catch (err) {
      setError('Failed to load repositories')
      console.error('Error fetching repositories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (repo: Repository) => {
    setSelectedRepo(repo)
    onSelect(repo)
    setIsOpen(false)
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
      >
        Login with GitHub
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate">
          {selectedRepo ? selectedRepo.full_name : 'Select a repository'}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {loading ? (
            <li className="text-gray-500 py-2 pl-3 pr-9 text-sm">Loading repositories...</li>
          ) : error ? (
            <li className="text-red-500 py-2 pl-3 pr-9 text-sm">{error}</li>
          ) : repos.length === 0 ? (
            <li className="text-gray-500 py-2 pl-3 pr-9 text-sm">No repositories found</li>
          ) : (
            repos.map((repo) => (
              <li
                key={repo.id}
                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                onClick={() => handleSelect(repo)}
              >
                <div className="flex items-center">
                  <span className="font-normal block truncate">{repo.full_name}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
