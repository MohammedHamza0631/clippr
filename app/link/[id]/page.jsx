'use client'

import { UrlState } from '@/context/url-provider'
import useFetch from '@/hooks/use-fetch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import LocationStats from '@/components/location-stats'
import DeviceStats from '@/components/device-stats'
import { getClicksForUrl } from '@/db/apiClicks'
import { deleteUrl, getUrl } from '@/db/apiUrls'
import { Copy, Download, LinkIcon, Trash, Check, MousePointerClick, Globe2, Dices as Devices } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BarLoader, BeatLoader } from 'react-spinners'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const LinkPage = ({ params }) => {
  const { id } = params
  const { user } = UrlState()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

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

  useEffect(() => {
    if (user && user.id) {
      fnGetUrl()
    }
  }, [user])

  useEffect(() => {
    if (!error && loading === false) {
      fnStats()
    }
  }, [loading, error])

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {(loading || loadingStats) && (
        <BarLoader width={'100%'} color='#6366f1' />
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Link Details Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='space-y-6'
        >
          <div className='bg-white/[0.02] border border-white/[0.08] rounded-lg p-6 space-y-6'>
            <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300'>
              {url?.title}
            </h1>

            {link && (
              <a
                href={`https://clipr.vercel.app/${link}`}
                target='_blank'
                rel='noreferrer'
                className='block text-xl text-indigo-400 hover:text-indigo-300 transition-colors break-all'
              >
                https://clipr.vercel.app/{link}
              </a>
            )}

            <a
              href={url?.original_url}
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors break-all'
            >
              <LinkIcon className='h-4 w-4 flex-shrink-0' />
              {url?.original_url}
            </a>

            <div className='text-white/40 text-sm'>
              Created {url?.created_at ? new Date(url.created_at).toLocaleString() : null}
            </div>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={copyToClipboard}
                className='relative bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] text-white'
              >
                <span className='sr-only'>{copied ? 'Copied' : 'Copy'}</span>
                <Copy className={`h-4 w-4 transition-all duration-300 ${copied ? 'scale-0' : 'scale-100'}`} />
                <Check className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${copied ? 'scale-100' : 'scale-0'}`} />
              </Button>

              <Button
                variant='outline'
                size='icon'
                onClick={downloadImage}
                className='relative bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] text-white'
              >
                <span className='sr-only'>{downloading ? 'Downloaded' : 'Download QR'}</span>
                <Download className={`h-4 w-4 transition-all duration-300 ${downloading ? 'scale-0' : 'scale-100'}`} />
                <Check className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${downloading ? 'scale-100' : 'scale-0'}`} />
              </Button>

              <Button
                variant='outline'
                size='icon'
                onClick={() => fnDelete().then(() => router.push('/dashboard'))}
                disabled={loadingDelete}
                className='bg-white/[0.02] border-white/[0.08] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-white/80'
              >
                {loadingDelete ? <BeatLoader size={5} color='white' /> : <Trash className="h-4 w-4" />}
              </Button>
            </div>

            <div className='relative'>
              {!imageLoaded && (
                <Skeleton className='h-64 w-64 rounded-lg bg-white/[0.02]' />
              )}
              <img
                src={url?.qr_code}
                className={`h-64 w-64 rounded-lg border border-indigo-500/20 bg-white/[0.02] p-2 transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                alt='QR code'
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className='bg-white/[0.02] border-white/[0.08]'>
            <CardHeader>
              <CardTitle className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300'>
                Analytics Overview
              </CardTitle>
            </CardHeader>
            
            {stats && stats.length ? (
              <CardContent className='space-y-8'>
                <Card className='bg-white/[0.02] border-white/[0.08]'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-white/90'>
                      <MousePointerClick className='h-5 w-5 text-rose-400' />
                      Total Clicks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-300 to-white/90'>
                      {stats?.length}
                    </p>
                  </CardContent>
                </Card>

                <div className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-white/90'>
                      <Globe2 className='h-5 w-5 text-cyan-400' />
                      Geographic Distribution
                    </h3>
                    <LocationStats stats={stats} />
                  </div>

                  <div className='space-y-4'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-white/90'>
                      <Devices className='h-5 w-5 text-amber-400' />
                      Device Breakdown
                    </h3>
                    <DeviceStats stats={stats} />
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className='text-white/60 text-center py-12'>
                {loadingStats ? 'Loading analytics...' : 'No clicks recorded yet'}
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default LinkPage