'use client'

import React, { useState } from 'react'
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
    const fileName = url?.title // Desired file name for the downloaded image
    if (!imageUrl) {
      console.error('Image URL is missing.')
      return
    }

    try {
      setDownloading(true)
      // Fetch the image as a blob
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      // Create a URL for the blob
      const blobUrl = URL.createObjectURL(blob)

      // Create an anchor element
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `${fileName}.png` // Set the file name and extension

      // Append the anchor to the body
      document.body.appendChild(anchor)

      // Trigger the download
      anchor.click()

      // Clean up: Remove the anchor and revoke the blob URL
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
    <div className='flex flex-col md:flex-row gap-5 border p-4 bg-zinc-900 rounded-lg'>
      <img
        src={url?.qr_code}
        className='h-32 object-contain ring ring-blue-500 self-start rounded-lg backdrop-filter backdrop-blur-md'
        alt='qr code'
      />
      <Link href={`/link/${url?.id}`} className='flex flex-col flex-1 gap-2'>
        <span className='text-2xl md:text-3xl font-extrabold hover:underline cursor-pointer'>
          {url?.title}
        </span>
        <span className='object-contain text-2xl text-blue-400 md:font-bold hover:underline cursor-pointer'>
          https://clipr.vercel.app/{url?.custom_url ? url?.custom_url : url.short_url}
        </span>
        <span className='flex text-sm md:text-lg items-center gap-1 hover:underline cursor-pointer'>
          <LinkIcon className='p-1' />
          {url?.original_url}
        </span>
        <span className='flex items-end font-extralight text-sm flex-1'>
          {new Date(url?.created_at).toLocaleString()}
        </span>
      </Link>
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
          onClick={() => fnDelete().then(() => fetchUrls())}
          disable={loadingDelete}
        >
          {loadingDelete ? <BeatLoader size={5} color='white' /> : <Trash />}
        </Button>
      </div>
    </div>
  )
}
