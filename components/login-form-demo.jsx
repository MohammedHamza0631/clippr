'use client'
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import Error from './error'
import * as Yup from 'yup'
import { useRouter, useSearchParams } from 'next/navigation'

import { login } from '@/db/apiAuth'
import { UrlState } from '@/context/url-provider'

import { signup } from '@/db/apiAuth'
import { BeatLoader } from 'react-spinners'
import useFetch from '@/hooks/use-fetch'

export default function LoginFormDemo () {
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleLogin = async () => {
    setErrors({})
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email('Invalid email')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required')
      })

      await schema.validate(formData, { abortEarly: false })
      await fnLogin()
    } catch (e) {
      const newErrors = {}

      e?.inner?.forEach(err => {
        newErrors[err.path] = err.message
      })

      setErrors(newErrors)
    }
  }

  const { loading, error, fn: fnLogin, data } = useFetch(login, formData)
  const { fetchUser } = UrlState()
  const searchParams = useSearchParams()
  const longLink = searchParams.get('createNew')
  const router = useRouter()
  useEffect(() => {
    // console.log(data, error)
    if (data && error === null) {
      router.push(`/dashboard?${longLink ? `createNew=${longLink}` : ''}`)
      fetchUser()
    }
  }, [data, error])

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin();
  };

  return (
    <div className=' w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-black'>
      <h2 className='font-bold text-xl text-neutral-200'>Login</h2>
      <p className='text-sm max-w-sm mt-2 text-neutral-300'>
        login to your account if you have one
      </p>
      {error && <Error message={error?.message} />}
      <form onSubmit={handleSubmit} className='my-8'>
        <LabelInputContainer className='mb-4'>
          <Label className='text-neutral-200' htmlFor='email'>
            Email
          </Label>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='Enter Email'
            className='text-neutral-300 rounded-lg border border-neutral-800 w-full bg-neutral-950 placeholder:text-neutral-700'
            onChange={handleInputChange}
          />
          {errors.email && <Error message={errors.email} />}
        </LabelInputContainer>
        <LabelInputContainer className='mb-4'>
          <Label className='text-neutral-200' htmlFor='password'>
            Password
          </Label>
          <Input
            id='password'
            name='password'
            type='password'
            placeholder='••••••••'
            className='text-neutral-300 rounded-lg border border-neutral-800 w-full bg-neutral-950 placeholder:text-neutral-700'
            onChange={handleInputChange}
          />
          {errors.password && <Error message={errors.password} />}
        </LabelInputContainer>

        <button
          type='submit'
          className='bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 block bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]'
          disabled={loading}
        >
          {loading ? <BeatLoader size={10} color='#36d7b7' /> : 'Log in'}
          <BottomGradient />
        </button>

        <div className='bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full' />

        <div className='flex flex-col space-y-4'>
          <button
            className=' relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]'
            type='submit'
          >
            <IconBrandGoogle className='h-4 w-4 text-neutral-300' />
            <span className='text-neutral-300 text-sm'>Log In with Google</span>

            <BottomGradient />
                  </button>
                  {<span className='text-center font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300'>Coming Soon!!</span>}
        </div>
      </form>
    </div>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className='group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-rose-500 to-transparent' />
      <span className='group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-rose-500 to-transparent' />
    </>
  )
}

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col space-y-2 w-full', className)}>
      {children}
    </div>
  )
}
