'use client'

import React, { useEffect, useRef, useState } from 'react'
import Error from './error'
import * as yup from 'yup'
import useFetch from '@/hooks/use-fetch'
import { createUrl } from '@/db/apiUrls'
import { BeatLoader } from 'react-spinners'
import { UrlState } from '@/context/url-provider'
import { QRCode } from 'react-qrcode-logo'
import { cn } from '@/lib/utils'
import useMediaQuery from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import GradientButton  from '@/components/ui/GradientButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { Drawer } from 'vaul'
import { ShimmerButton } from './ui/shimmer-button'

export default function CreateLink ({ fetchUrls }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = useState(false)
  const { user } = UrlState()

  const router = useRouter()
  const ref = useRef()
  const searchParams = useSearchParams()

  const longLink = searchParams.get('createNew')

  const [errors, setErrors] = useState({})

  const [formValues, setFormValues] = useState({
    title: '',
    longUrl: longLink ? longLink : '',
    customUrl: ''
  })

  const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    longUrl: yup
      .string()
      .url('Must be a valid URL')
      .required('Long URL is required'),
    customUrl: yup.string()
  })

  const handleChange = e => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value
    })
  }
  const {
    loading,
    error,
    data,
    fn: fnCreateUrl
  } = useFetch(createUrl, { ...formValues, user_id: user.id })

  useEffect(() => {
    if (error === null && data) {
      router.push(`/link/${data[0].id}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data])

  const createNewLink = async () => {
    setErrors([])
    try {
      await schema.validate(formValues, { abortEarly: false })

      const canvas = ref.current.canvasRef.current
      const blob = await new Promise(resolve => canvas.toBlob(resolve))

      await fnCreateUrl(blob).then(() => fetchUrls())
    } catch (e) {
      const newErrors = {}

      e?.inner?.forEach(err => {
        newErrors[err.path] = err.message
      })

      setErrors(newErrors)
    }
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }

  if (isDesktop) {
    return (
      <Dialog
        defaultOpen={longLink}
        onOpenChange={res => {
          if (!res) {
            router.push('/dashboard')
          }
        }}
      >
        <DialogTrigger asChild>
          <ShimmerButton className='shadow-2xl'>
            <span className='whitespace-pre-wrap text-center text-xs leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg'>
              Create Link
            </span>
          </ShimmerButton>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Create a new Link</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-square max-w-[250px] h-[250px] mx-auto">
            {!formValues?.longUrl ? (
              <div className="w-full h-full rounded-lg relative overflow-hidden bg-zinc-950/50">
                <p className='text-center text-neutral-300 text-sm'>QR Code</p>
                <span className='absolute inset-x-0 top-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent'></span>
                <span className='absolute inset-x-0 bottom-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent'></span>
                <span className='absolute inset-y-0 left-px w-px my-auto bg-gradient-to-b from-transparent via-rose-400 to-transparent'></span>
                <span className='absolute inset-y-0 right-px w-px my-auto bg-gradient-to-b from-transparent via-rose-400 to-transparent'></span>
                <div className="absolute inset-0 bg-zinc-900/50"></div>
              </div>
            ) : (
              <div className="w-full h-full rounded-lg relative overflow-hidden bg-zinc-950/50 p-4">
                <span className='absolute inset-x-0 top-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent'></span>
                <span className='absolute inset-x-0 bottom-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent'></span>
                <span className='absolute inset-y-0 left-px w-px my-auto bg-gradient-to-b from-transparent via-rose-400 to-transparent'></span>
                <span className='absolute inset-y-0 right-px w-px my-auto bg-gradient-to-b from-transparent via-rose-400 to-transparent'></span>
                <QRCode
                  qrStyle='dots'
                  eyeRadius={10}
                  ref={ref}
                  size={200}
                  value={formValues?.longUrl}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
          <Input
            id='title'
            placeholder="Short Link's Title"
            value={formValues.title}
            className='bg-zinc-950 text-neutral-300'
            onChange={handleChange}
          />
          {errors.title && <Error message={errors.title} />}
          <Input
            id='longUrl'
            placeholder='Enter your Loooong URL'
            value={formValues.longUrl}
            className='bg-zinc-950 text-neutral-300'
            onChange={handleChange}
          />
          {errors.longUrl && <Error message={errors.longUrl} />}
          <div className='flex items-center gap-2'>
            <Badge className='p-2 bg-zinc-400'>clipr.vercel.app</Badge> /
            <Input
              id='customUrl'
              placeholder='Custom Link (optional)'
              value={formValues.customUrl}
              className='bg-zinc-950 text-neutral-300'
              onChange={handleChange}
            />
          </div>
          {error && <Error message={errors.message} />}
          <DialogFooter className='sm:justify-start'>
            <GradientButton
              type='button'
              onClick={createNewLink}
              disabled={loading}
              className='w-fit h-12 flex items-center justify-center px-12 rounded-lg'
            >
              {loading ? <BeatLoader size={10} color='rose-400' /> : 'Create'}
            </GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer.Root
      modal={true}
      defaultOpen={longLink}
      onOpenChange={res => {
        if (!res) {
          router.push('/dashboard')
        }
      }}
    >
      <Drawer.Trigger asChild>
        <ShimmerButton className='shadow-2xl'>
          <span className='whitespace-pre-wrap text-center text-xs leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg'>
            Create Link
          </span>
        </ShimmerButton>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 bg-black/40' />
        <Drawer.Content className='bg-[#161615] text-white flex flex-col fixed bottom-0 left-0 right-0 max-h-[82vh] rounded-t-[10px]'>
          <div className='max-w-md w-full mx-auto overflow-auto p-4 rounded-t-[10px]'>
            <Drawer.Handle />
            <Drawer.Title className='font-medium text-white mt-8'>
              Create a new Link
            </Drawer.Title>
            <Drawer.Description className='leading-6 mt-2 text-gray-400'>
              Fill in the information below to create your new link.
            </Drawer.Description>

            <div className="relative w-full aspect-square max-w-[250px] mx-auto">
              {!formValues?.longUrl ? (
                <div className="mt-4 w-full h-full rounded-lg relative overflow-hidden bg-zinc-950/50">
                  <p className='text-center text-neutral-300 text-sm'>QR Code</p>
                  <span className='absolute inset-x-0 top-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent'></span>
                  <span className='absolute inset-x-0 bottom-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent'></span>
                  <span className='absolute inset-y-0 left-px w-px my-auto bg-gradient-to-b from-transparent via-rose-400 to-transparent'></span>
                  <span className='absolute inset-y-0 right-px w-px my-auto bg-gradient-to-b from-transparent via-rose-400 to-transparent'></span>
                  <div className="absolute inset-0 bg-zinc-900/50"></div>
                </div>
              ) : (
                <div className="mt-4 w-full h-full rounded-lg relative overflow-hidden bg-zinc-950/50 p-4">
                  <span className='absolute inset-x-0 top-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent'></span>
                  <span className='absolute inset-x-0 bottom-px h-px mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent'></span>
                  <span className='absolute inset-y-0 left-px w-px my-auto bg-gradient-to-b from-transparent via-rose-400 to-transparent'></span>
                  <span className='absolute inset-y-0 right-px w-px my-auto bg-gradient-to-b from-transparent via-rose-400 to-transparent'></span>
                  <QRCode
                    qrStyle='dots'
                    eyeRadius={10}
                    ref={ref}
                    size={200}
                    value={formValues?.longUrl}
                    className=" w-full h-full"
                  />
                </div>
              )}
            </div>

            <Label
              htmlFor='title'
              className='font-medium text-white text-sm mt-8 mb-2 block'
            >
              Title
            </Label>
            <Input
              id='title'
              placeholder="Short Link's Title"
              value={formValues.title}
              onChange={handleChange}
              className='border border-gray-200 w-full rounded-lg outline-none focus:ring-2 focus:ring-gray-500 bg-zinc-950 text-neutral-300'
            />
            {errors.title && <Error message={errors.title} />}

            <Label
              htmlFor='longUrl'
              className='font-medium text-white text-sm mt-8 mb-2 block'
            >
              Long URL
            </Label>
            <Input
              id='longUrl'
              placeholder='Enter your Loooong URL'
              value={formValues.longUrl}
              onChange={handleChange}
              className='bg-zinc-950 text-neutral-300 border border-gray-200 w-full rounded-lg outline-none focus:ring-2 focus:ring-gray-500'
            />
            {errors.longUrl && <Error message={errors.longUrl} />}

            <Label
              htmlFor='customUrl'
              className='font-medium text-white text-sm mt-8 mb-2 block'
            >
              Custom URL (optional)
            </Label>
            <div className='flex items-center gap-2'>
              <Badge className='p-2 bg-zinc-600' variant={'outline'}>
                clipr.vercel.app
              </Badge>{' '}
              /
              <Input
                id='customUrl'
                placeholder='Custom URL'
                value={formValues.customUrl}
                onChange={handleChange}
                className='bg-zinc-950 text-neutral-300 border border-gray-200 dark:border-gray-700 w-full rounded-lg outline-none focus:ring-2 focus:ring-gray-500'
              />
            </div>
            {error && <Error message={error.message} />}

            <GradientButton
              onClick={createNewLink}
              disabled={loading}
              className='mt-4 w-fit h-12 flex items-center justify-center px-12 rounded-lg'
            >
              {loading ? <BeatLoader size={10} color='rose-400' /> : 'Create'}
            </GradientButton>

            {/* <Button variant='outline' onClick={handleDrawerClose}>
              Cancel
            </Button> */}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
