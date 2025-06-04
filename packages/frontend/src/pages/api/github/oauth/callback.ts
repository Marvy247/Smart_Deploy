import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' })
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth credentials are not configured')
    }

    // Exchange code for access token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for access token')
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error_description || 'Failed to exchange code for access token')
    }

    // Return the access token to the client
    return res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    return res.status(500).json({
      error: 'Failed to complete OAuth process',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
