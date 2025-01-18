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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CreateLink () {
  const isDesktop = useMediaQuery('(min-width: 768px)')

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

      await fnCreateUrl(blob)
    } catch (e) {
      const newErrors = {}

      e?.inner?.forEach(err => {
        newErrors[err.path] = err.message
      })

      setErrors(newErrors)
    }
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
          <Button variant='outline'>Create Link</Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Create a new Link</DialogTitle>
          </DialogHeader>
          {formValues?.longUrl && (
            <QRCode
              qrStyle='dots'
              eyeRadius={10}
              ref={ref}
              size={250}
              value={formValues?.longUrl}
            />
          )}
          <Input
            id='title'
            placeholder="Short Link's Title"
            value={formValues.title}
            onChange={handleChange}
          />
          {errors.title && <Error message={errors.title} />}
          <Input
            id='longUrl'
            placeholder='Enter your Loooong URL'
            value={formValues.longUrl}
            onChange={handleChange}
          />
          {errors.longUrl && <Error message={errors.longUrl} />}
          <div className='flex items-center gap-2'>
            <Card className='p-2'>clipr.live</Card> /
            <Input
              id='customUrl'
              placeholder='Custom Link (optional)'
              value={formValues.customUrl}
              onChange={handleChange}
            />
          </div>
          {error && <Error message={errors.message} />}
          <DialogFooter className='sm:justify-start'>
            <Button
              type='button'
              variant='destructive'
              onClick={createNewLink}
              disabled={loading}
            >
              {loading ? <BeatLoader size={10} color='white' /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      defaultOpen={longLink}
      onOpenChange={res => {
        if (!res) {
          router.push('/dashboard')
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button variant='outline'>Create Link</Button>
      </DrawerTrigger>
      <DrawerContent className='flex flex-col gap-4 px-2 0'>
        <DrawerHeader className='text-left'>
          <DrawerTitle>Create a new Link</DrawerTitle>
        </DrawerHeader>
        {formValues?.longUrl && (
          <QRCode
            qrStyle='dots'
            eyeRadius={10}
            ref={ref}
            size={250}
            value={formValues?.longUrl}
          />
        )}
        <Input
          id='title'
          placeholder="Short Link's Title"
          value={formValues.title}
          onChange={handleChange}
        />
        {errors.title && <Error message={errors.title} />}
        <Input
          id='longUrl'
          placeholder='Enter your Loooong URL'
          value={formValues.longUrl}
          onChange={handleChange}
        />
        {errors.longUrl && <Error message={errors.longUrl} />}
        <div className='flex items-center gap-2'>
          <Card className='p-2'>clipr.live</Card> /
          <Input
            id='customUrl'
            placeholder='Custom URL (optional)'
            value={formValues.customUrl}
            onChange={handleChange}
            className='focus:ring-8  focus:ring-red-500'
          />
        </div>
        {error && <Error message={errors.message} />}
        <DrawerFooter className='pt-2'>
          <Button
            type='button'
            variant='destructive'
            onClick={createNewLink}
            disabled={loading}
          >
            {loading ? <BeatLoader size={10} color='white' /> : 'Create'}
          </Button>
          <DrawerClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
