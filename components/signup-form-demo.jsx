'use client'
import { IconBrandGithub, IconBrandGoogle, IconBrandOnlyfans } from '@tabler/icons-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { space } from 'postcss/lib/list'
import React, { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import * as Yup from 'yup'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signup } from '@/db/apiAuth'
import useFetch from '@/hooks/use-fetch'
import { cn } from '@/lib/utils'
import { UrlState } from '@/context/url-provider'
import ErrorMessage from './error'

export default function SignupFormDemo() {
  const searchParams = useSearchParams()
  const longLink = searchParams.get('createNew')
  const router = useRouter()
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile_pic: null,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleSignup()
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }))
  }
  const { loading, error, fn: fnSignup, data } = useFetch(signup, formData)
  const { fetchUser } = UrlState()

  useEffect(() => {
    if (error === null && data) {
      fetchUser()
      router.push(`/dashboard${longLink ? `?createNew=${encodeURIComponent(longLink)}` : ''}`)
    }
  }, [error, loading])

  const handleSignup = async () => {
    setErrors([])
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
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
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message
        })

        setErrors(newErrors)
      } else {
        setErrors({ api: error.message })
      }
    }
  }

  return (
    <div className=" w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-black">
      <h2 className="font-bold text-xl text-neutral-200">Create an account</h2>
      <p className="text-sm max-w-sm mt-2 text-neutral-300">Create an account to get started</p>
      {error && <ErrorMessage message={error?.message} />}
      <form onSubmit={handleSubmit} className="my-8">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label className="text-neutral-200" htmlFor="firstname">
              Name
            </Label>
            <Input
              name="name"
              type="text"
              placeholder="Enter Name"
              className="rounded-lg border border-neutral-800 w-full text-neutral-300 bg-neutral-950 placeholder:text-neutral-700"
              onChange={handleInputChange}
            />
            {errors.name && <ErrorMessage message={errors.name} />}
          </LabelInputContainer>
        </div>

        <LabelInputContainer className="mb-4">
          <Label className="text-neutral-200" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter Email"
            className="text-neutral-300 rounded-lg border border-neutral-800 w-full bg-neutral-950 placeholder:text-neutral-700"
            onChange={handleInputChange}
          />
          {errors.email && <ErrorMessage message={errors.email} />}
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label className="text-neutral-200" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="text-neutral-300 rounded-lg border border-neutral-800 w-full bg-neutral-950 placeholder:text-neutral-700"
            onChange={handleInputChange}
          />
          {errors.password && <ErrorMessage message={errors.password} />}
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label className="text-neutral-200" htmlFor="profile_pic">
            Profile Picture
          </Label>
          <Input
            name="profile_pic"
            type="file"
            accept="image/*"
            className="text-neutral-300 rounded-lg border border-neutral-800 w-full bg-neutral-950 placeholder:text-neutral-400"
            placeholder="Upload Profile Picture"
            onChange={handleInputChange}
          />
        </LabelInputContainer>
        {errors.profile_pic && <ErrorMessage message={errors.profile_pic} />}
        <button
          type="submit"
          className="bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 block bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          disabled={loading}
        >
          {loading ? <BeatLoader size={10} color="#36d7b7" /> : 'Sign up'}
          <BottomGradient />
        </button>
      </form>
    </div>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
    </>
  )
}

const LabelInputContainer = ({ children, className }) => {
  return <div className={cn('flex flex-col space-y-2 w-full', className)}>{children}</div>
}
