'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, Check, LinkIcon, Trash } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import useFetch from '@/hooks/use-fetch'
import { deleteUrl } from '@/db/apiUrls'
import { BeatLoader } from 'react-spinners'

export default function LinkCard ({ url, fetchUrls }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

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

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url.id)

  return (
    <div className='bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 rounded-lg overflow-hidden'>
      <div className='flex flex-col md:flex-row gap-6 p-6'>
        <div className='flex-shrink-0'>
          <img
            src={url?.qr_code}
            className='h-32 w-32 object-contain rounded-lg border border-indigo-500/20 bg-white/[0.02] p-2'
            alt='QR code'
          />
        </div>

        <Link href={`/link/${url?.id}`} className='flex flex-col flex-1 gap-3'>
          <span className='text-2xl font-bold text-white hover:text-white/90 transition-colors'>
            {url?.title}
          </span>
          <span className='text-lg text-indigo-400 hover:text-indigo-300 transition-colors break-all'>
            <Link
              href={`https://clipr.vercel.app/${url?.custom_url ? url?.custom_url : url.short_url}`}
              
            >
              https://clipr.vercel.app/
              {url?.custom_url ? url?.custom_url : url.short_url}
            </Link>
          </span>
          <span className='flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors text-sm break-all'>
            <LinkIcon className='h-4 w-4 flex-shrink-0' />
            {url?.original_url}
          </span>
          <span className='text-white/40 text-sm mt-auto'>
            Created {new Date(url?.created_at).toLocaleString()}
          </span>
        </Link>

        <div className='flex md:flex-col gap-2 self-start'>
          <Button
            variant='outline'
            size='icon'
            onClick={copyToClipboard}
            className='relative bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] text-white'
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
            onClick={downloadImage}
            className='relative bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] text-white'
          >
            <span className='sr-only'>
              {downloading ? 'Downloaded' : 'Download QR'}
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
            onClick={() => fnDelete().then(() => fetchUrls())}
            disabled={loadingDelete}
            className='bg-white/[0.02] border-white/[0.08] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-white/80'
          >
            {loadingDelete ? (
              <BeatLoader size={5} color='white' />
            ) : (
              <Trash className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
