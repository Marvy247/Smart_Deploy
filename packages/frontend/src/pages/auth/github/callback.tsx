import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function GitHubCallback() {
  const router = useRouter()

  useEffect(() => {
    const fetchAccessToken = async (code: string) => {
      try {
        const response = await fetch('/api/github/oauth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })
        if (!response.ok) {
          throw new Error('Failed to fetch access token')
        }
        const data = await response.json()
        localStorage.setItem('githubToken', data.access_token)
        router.replace('/')
      } catch (error) {
        console.error('OAuth callback error:', error)
        router.replace('/login')
      }
    }

    if (router.query.code) {
      fetchAccessToken(router.query.code as string)
    }
  }, [router])

  return <div>Loading GitHub OAuth callback...</div>
}
