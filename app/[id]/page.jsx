'use client'

import { useEffect } from 'react'
import { BarLoader } from 'react-spinners'
import { useRouter } from 'next/navigation'

import {
  getLongUrl
} from '@/db/apiUrls'
import { storeClicks } from '@/db/apiClicks'
import useFetch from '@/hooks/use-fetch'

export default function RedirectLink ({ params }) {
  const router = useRouter()
  const { id } = params

  const { loadings, data: urlData, fn: fnGetLongUrl } = useFetch(getLongUrl, id)

  const { loading: loadingClick, fn: fnStoreClicks } = useFetch(storeClicks, {
    id: urlData?.id,
    originalUrl: urlData?.original_url
  })

  useEffect(() => {
    console.log('Getting Long URL...')
    fnGetLongUrl()
  }, [])

  useEffect(() => {
    if (!loadings && urlData) {
      console.log('Storing Clicks...')
      fnStoreClicks()
    }
  }, [loadings, urlData])

  useEffect(() => {
    if (!loadings && !loadingClick && urlData?.original_url) {
      window.location.href = urlData.original_url
    }
  }, [loadings, loadingClick, urlData])

  if (loadings || loadingClick) {
    return (
      <>
        <BarLoader width={'100%'} color='#36d7b7' />
        <br />
        <p>Redirecting...</p>
      </>
    )
  }
  return null
}
