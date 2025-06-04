import React, { useState, useEffect, useMemo } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
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
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRepos = useMemo(() => {
    return repos.filter(repo => 
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [repos, searchTerm])

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
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search repositories..."
            className="block w-full pl-10 pr-3 py-2 border-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="button"
            className="flex items-center px-4 py-2 border-l border-gray-300 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedRepo ? (
              <div className="flex items-center">
                <img 
                  src={selectedRepo.owner.avatar_url} 
                  alt={selectedRepo.owner.login}
                  className="w-5 h-5 rounded-full mr-2"
                />
                <span className="truncate">{selectedRepo.full_name}</span>
              </div>
            ) : 'Select'}
            <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {loading ? (
            <li className="text-gray-500 py-2 pl-3 pr-9 text-sm">Loading repositories...</li>
          ) : error ? (
            <li className="text-red-500 py-2 pl-3 pr-9 text-sm">{error}</li>
          ) : repos.length === 0 ? (
            <li className="text-gray-500 py-2 pl-3 pr-9 text-sm">No repositories found</li>
          ) : (
            filteredRepos.map((repo) => (
              <li
                key={repo.id}
                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                onClick={() => handleSelect(repo)}
              >
                <div className="flex items-center">
                  <img 
                    src={repo.owner.avatar_url} 
                    alt={repo.owner.login}
                    className="w-5 h-5 rounded-full mr-2"
                  />
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
