import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <Head>
      <title>Redirecting...</title>
    </Head>
  )
}
