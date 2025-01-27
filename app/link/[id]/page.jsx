'use client'

import { UrlState } from '@/context/url-provider'
import useFetch from '@/hooks/use-fetch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LocationStats from '@/components/location-stats'
import DeviceStats from '@/components/device-stats'
import { getClicksForUrl } from '@/db/apiClicks'
import { deleteUrl, getUrl } from '@/db/apiUrls'
import { Copy, Download, LinkIcon, Trash, Check } from 'lucide-react'
import { useEffect, useState, Suspense, lazy } from 'react'
import { BarLoader, BeatLoader } from 'react-spinners'
import { useRouter } from 'next/navigation'
import React from 'react'

const LinkPage = ({ params }) => {
  const { id } = params
  const { user } = UrlState()
  const router = useRouter()
  const LazyImage = lazy(() => import('@/components/LazyImage'))
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const {
    loading,
    data: url,
    fn: fnGetUrl,
    error
  } = useFetch(getUrl, { id, user_id: user?.id })

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats
  } = useFetch(getClicksForUrl, id)

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id)
  // console.log(stats)

  useEffect(() => {
    if (user && user.id) {
      fnGetUrl()
    }
  }, [user])

  // Fetch stats after URL is loaded
  useEffect(() => {
    if (!error && loading === false) {
      fnStats()
    }
  }, [loading, error])

  // Redirect to dashboard if there's an error
  useEffect(() => {
    if (error) {
      router.push('/dashboard')
    }
  }, [error])

  const link = url?.custom_url ? url?.custom_url : url?.short_url

  const downloadImage = async () => {
    const imageUrl = url?.qr_code
    const fileName = url?.title
    if (!imageUrl) {
      console.error('Image URL is missing.')
      return
    }

    try {
      setDownloading(true)
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `${fileName}.png`

      document.body.appendChild(anchor)

      anchor.click()

      document.body.removeChild(anchor)
      URL.revokeObjectURL(blobUrl)
      setTimeout(() => setDownloading(false), 2000)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      'https://clipr.vercel.app/' +
        (url?.custom_url ? url?.custom_url : url.short_url)
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <>
      {(loading || loadingStats) && (
        <BarLoader className='mb-4' width={'100%'} color='#36d7b7' />
      )}
      <div className='flex flex-col gap-8 sm:flex-row justify-between'>
        <div className='flex flex-col items-start gap-8 rounded-lg sm:w-2/5'>
          <span className='text-6xl font-extrabold hover:underline cursor-pointer'>
            {url?.title}
          </span>
          {link && (
            <a
              href={`https://clipr.vercel.app/${link}`}
              target='_blank'
              rel='noreferrer'
              className='text-xl sm:text-4xl text-blue-400 font-bold hover:underline'
            >
              https://clipr.vercel.app/{link}
            </a>
          )}
          <a
            href={url?.original_url}
            target='_blank'
            className='flex items-center text-md gap-1 hover:underline cursor-pointer'
          >
            <LinkIcon className='p-1' />
            {url?.original_url}
          </a>
          <span className='flex items-end font-extralight text-sm'>
            {url?.created_at ? new Date(url.created_at).toLocaleString() : null}
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='icon'
              className='relative ml-2 rounded-md'
              onClick={copyToClipboard}
              aria-label={copied ? 'Copied' : 'Copy to clipboard'}
            >
              <span className='sr-only'>{copied ? 'Copied' : 'Copy'}</span>
              <Copy
                className={`h-4 w-4 transition-all duration-300 ${
                  copied ? 'scale-0' : 'scale-100'
                }`}
              />
              <Check
                className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${
                  copied ? 'scale-100' : 'scale-0'
                }`}
              />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='relative ml-2 rounded-md'
              onClick={downloadImage}
              aria-label={downloading ? 'Downloaded' : 'Download Image'}
            >
              <span className='sr-only'>
                {downloading ? 'Downloaded' : 'Download Image'}
              </span>
              <Download
                className={`h-4 w-4 transition-all duration-300 ${
                  downloading ? 'scale-0' : 'scale-100'
                }`}
              />
              <Check
                className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${
                  downloading ? 'scale-100' : 'scale-0'
                }`}
              />
            </Button>

            <Button
              variant='outline'
              size='icon'
              onClick={() =>
                fnDelete().then(() => {
                  router.push('/dashboard')
                })
              }
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <BeatLoader size={5} color='white' />
              ) : (
                <Trash />
              )}
            </Button>
          </div>
          <Suspense fallback='QR code Loading...'>
            <LazyImage src={url?.qr_code} alt='QR Code' />
          </Suspense>
        </div>

        <Card className='sm:w-3/5'>
          <CardHeader>
            <CardTitle className='text-4xl font-extrabold'>Stats</CardTitle>
          </CardHeader>
          {stats && stats.length ? (
            <CardContent className='flex flex-col gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{stats?.length}</p>
                </CardContent>
              </Card>

              <CardTitle>Locations Data</CardTitle>
              <LocationStats stats={stats} />
              <CardTitle>Device Info</CardTitle>
              <DeviceStats stats={stats} />
            </CardContent>
          ) : (
            <CardContent>
              {loadingStats === false
                ? 'No Statistics yet'
                : 'Loading Statistics..'}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  )
}

export default LinkPage
