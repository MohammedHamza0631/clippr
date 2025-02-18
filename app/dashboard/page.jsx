'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarLoader } from 'react-spinners'
import {
  Filter, Search,
  Link as LinkIcon,
  BarChart3,
  MousePointerClick
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Error from '@/components/error'
import useFetch from '@/hooks/use-fetch'
import { getUrls } from '@/db/apiUrls'
import { getClicksForUrls } from '@/db/apiClicks'
import { UrlState } from '@/context/url-provider'
import LinkCard from '@/components/link-card'
import CreateLink from '@/components/create-link'

export default function Dashboard () {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = UrlState()
  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls, user.id)
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks
  } = useFetch(
    getClicksForUrls,
    urls?.map(url => url.id)
  )

  useEffect(() => {
    fnUrls()
  }, [])

  const filteredUrls = urls?.filter(url =>
    url.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (urls?.length) fnClicks()
  }, [urls?.length])

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {(loading || loadingClicks) && (
        <BarLoader width={'100%'} color='#6366f1' />
      )}

      <motion.div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
        <Card className='bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-white/90'>
              <LinkIcon className='h-5 w-5 text-indigo-400' />
              Links Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-white/90'>
              {urls?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-white/90'>
              <MousePointerClick className='h-5 w-5 text-rose-400' />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-300 to-white/90'>
              {clicks?.length || 0}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-8'>
        <h1 className='text-3xl font-bold'>My Links</h1>
        <CreateLink fetchUrls={fnUrls} />
      </motion.div>

      <motion.div className='relative mb-8'>
        <Input
          type='text'
          placeholder='Search Links...'
          value={searchQuery}
          className='text-neutral-300 bg-neutral-900'
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Search className='absolute top-2.5 right-3 h-5 w-5 text-white/40' />
      </motion.div>

      {error && <Error message={error?.message} />}

      <motion.div
        className='space-y-4'
        initial='initial'
        animate='animate'
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {(filteredUrls || []).map((url, i) => (
          <motion.div
            key={i}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
          >
            <LinkCard url={url} fetchUrls={fnUrls} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
