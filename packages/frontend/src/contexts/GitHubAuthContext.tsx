import React, { createContext, useContext, useState, useEffect } from 'react'

interface GitHubAuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: () => void
  logout: () => void
}

const GitHubAuthContext = createContext<GitHubAuthContextType | undefined>(undefined)

export const GitHubAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('githubToken')
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }
  }, [])

  const login = () => {
    // Redirect to GitHub OAuth
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/github/callback')
    const scope = encodeURIComponent('repo,workflow')
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
    window.location.href = url
  }

  const logout = () => {
    localStorage.removeItem('githubToken')
    setToken(null)
    setIsAuthenticated(false)
  }

  return (
    <GitHubAuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </GitHubAuthContext.Provider>
  )
}

export const useGitHubAuth = () => {
  const context = useContext(GitHubAuthContext)
  if (context === undefined) {
    throw new Error('useGitHubAuth must be used within a GitHubAuthProvider')
  }
  return context
}
