'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarLoader } from 'react-spinners'
import { UrlState } from '@/context/url-provider'

export default function RequireAuth ({ children }) {
  const router = useRouter()
  const { loading, isAuthenticated } = UrlState()

  useEffect(() => {
    if (!isAuthenticated && loading === false) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  if (loading) return <BarLoader width={'100%'} color='#36d7b7' />

  if (isAuthenticated) return children

  return null
}
