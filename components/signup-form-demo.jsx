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
import { signup } from '@/db/apiAuth'
import { BeatLoader } from 'react-spinners'
import useFetch from '@/hooks/use-fetch'
import { space } from 'postcss/lib/list'

export default function SignupFormDemo () {
  let searchParams = useSearchParams()
  const longLink = searchParams.get('createNew')
  const router = useRouter()
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile_pic: null
  })

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Form submitted')
  }

  const handleInputChange = e => {
    const { name, value, files } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: files ? files[0] : value
    }))
  }
  const { loading, error, fn: fnSignup, data } = useFetch(signup, formData)

  useEffect(() => {
    if (error === null && data) {
      router.push(`/dashboard?${longLink ? `createNew=${longLink}` : ''}`)
    }
  }, [error, loading])

  const handleSignup = async () => {
    setErrors([])
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string()
          .email('Invalid email')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        profile_pic: Yup.mixed().nullable()
      })

      await schema.validate(formData, { abortEarly: false })
      await fnSignup()
    } catch (error) {
      const newErrors = {}
      if (error?.inner) {
        error.inner.forEach(err => {
          newErrors[err.path] = err.message
        })

        setErrors(newErrors)
      } else {
        setErrors({ api: error.message })
      }
    }
  }

  return (
    <div className=' w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-black'>
      <h2 className='font-bold text-xl text-neutral-200'>Welcome to Clippr</h2>
      <p className='text-sm max-w-sm mt-2 text-neutral-300'>
        Create a new account if you haven&rsquo;t already
      </p>
      {error && <Error message={error?.message} />}
      <div className='my-8'>
        <div className='flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4'>
          <LabelInputContainer>
            <Label className='text-neutral-200' htmlFor='firstname'>
              Name
            </Label>
            <Input
              name='name'
              type='text'
              placeholder='Enter Name'
              className='rounded-lg border border-neutral-800 w-full text-neutral-300 bg-neutral-950 placeholder:text-neutral-700'
              onChange={handleInputChange}
            />
            {errors.name && <Error message={errors.name} />}
          </LabelInputContainer>
        </div>

        <LabelInputContainer className='mb-4'>
          <Label className='text-neutral-200' htmlFor='email'>
            Email
          </Label>
          <Input
            name='email'
            type='email'
            placeholder='Enter Email'
            className='text-neutral-300 rounded-lg border border-neutral-800 w-full  bg-neutral-950 placeholder:text-neutral-700'
            onChange={handleInputChange}
          />
          {errors.email && <Error message={errors.email} />}
        </LabelInputContainer>
        <LabelInputContainer className='mb-4'>
          <Label className='text-neutral-200' htmlFor='password'>
            Password
          </Label>
          <Input
            name='password'
            type='password'
            placeholder='••••••••'
            className='text-neutral-300 rounded-lg border border-neutral-800 w-full  bg-neutral-950 placeholder:text-neutral-700'
            onChange={handleInputChange}
          />
          {errors.password && <Error message={errors.password} />}
        </LabelInputContainer>
        <LabelInputContainer className='mb-4'>
          <Label className='text-neutral-200' htmlFor='profile_pic'>
            Profile Picture
          </Label>
          <Input
            name='profile_pic'
            type='file'
            accept='image/*'
            className='text-neutral-300 rounded-lg border border-neutral-800 w-full bg-neutral-950 placeholder:text-neutral-400'
            placeholder='Upload Profile Picture'
            onChange={handleInputChange}
          />
        </LabelInputContainer>
        {errors.profile_pic && <Error message={errors.profile_pic} />}
        <button
          onClick={handleSignup}
          className='bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 block bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]'
          type='submit'
        >
          {loading ? <BeatLoader size={10} color='#36d7b7' /> : 'Sign Up'}{' '}
          &rarr;
          <BottomGradient />
        </button>
      </div>
    </div>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className='group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent' />
      <span className='group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent' />
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
