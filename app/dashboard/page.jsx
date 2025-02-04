'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners'
import { Filter } from 'lucide-react'

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

  return (
    <div className='flex flex-col gap-8'>
      {(loading || loadingClicks) && (
        <BarLoader width={'100%'} color='#36d7b7' />
      )}
      <div className='grid grid-cols-2 gap-4'>
        <Card className='hover:shadow-lg hover:bg-zinc-900 transition-all duration-300'>
          <CardHeader>
            <CardTitle>Links Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{urls?.length}</p>
          </CardContent>
        </Card>
        <Card className='hover:shadow-lg hover:bg-zinc-900 transition-all duration-300'>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{clicks?.length}</p>
          </CardContent>
        </Card>
      </div>
      <div className='flex justify-between'>
        <h1 className='text-4xl font-extrabold'>My Links</h1>
        <CreateLink fetchUrls={fnUrls} />
      </div>
      <div className='relative'>
        <Input
          type='text'
          placeholder='Filter Links...'
          value={searchQuery}
          className='text-neutral-300 bg-neutral-900'
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Filter className='absolute top-2 right-2 p-1' />
      </div>
      {error && <Error message={error?.message} />}
      {(filteredUrls || []).map((url, i) => (
        <LinkCard key={i} url={url} fetchUrls={fnUrls} />
      ))}
    </div>
  )
}
