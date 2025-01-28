import React from 'react'
import { useEffect, useState } from 'react'
import Error from './error'
import { Input } from './ui/input'
import * as Yup from 'yup'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card'
import { Button } from './ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { signup } from '@/db/apiAuth'
import { BeatLoader } from 'react-spinners'
import useFetch from '@/hooks/use-fetch'
import { FileUpload } from './ui/file-upload'

export default function Signup () {
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
        profile_pic: Yup.mixed().nullable(),
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
    <Card>
      <CardHeader>
        <CardTitle>Signup</CardTitle>
        <CardDescription className='text-neutral-400'>
          Create a new account if you haven&rsquo;t already
        </CardDescription>
        {error && <Error message={error?.message} />}
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='space-y-1'>
          <Input
            name='name'
            type='text'
            placeholder='Enter Name'
            className='rounded-lg border border-neutral-800 w-full  bg-neutral-950 placeholder:text-neutral-700'
            onChange={handleInputChange}
          />
        </div>
        {errors.name && <Error message={errors.name} />}
        <div className='space-y-1'>
          <Input
            name='email'
            type='email'
            placeholder='Enter Email'
            className='rounded-lg border border-neutral-800 w-full  bg-neutral-950 placeholder:text-neutral-700'
            onChange={handleInputChange}
          />
        </div>
        {errors.email && <Error message={errors.email} />}
        <div className='space-y-1'>
          <Input
            name='password'
            type='password'
            placeholder='••••••••'
            className='rounded-lg border border-neutral-800 w-full  bg-neutral-950 placeholder:text-neutral-700'
            onChange={handleInputChange}
          />
        </div>
        {errors.password && <Error message={errors.password} />}
        <div className='space-y-1'>
          <Input
            name='profile_pic'
            type='file'
            accept='image/*'
            className='rounded-lg border border-neutral-800 w-full bg-neutral-950 placeholder:text-neutral-400'
            placeholder='Upload Profile Picture'
            onChange={handleInputChange}
          />
        </div>
        {errors.profile_pic && <Error message={errors.profile_pic} />}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSignup}>
          {loading ? (
            <BeatLoader size={10} color='#36d7b7' />
          ) : (
            'Create Account'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

const BottomGradient = () => {
  return (<>
    <span
      className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    <span
      className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
  </>);
};

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    (<div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>)
  );
};

