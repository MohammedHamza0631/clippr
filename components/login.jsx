'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import * as Yup from 'yup'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UrlState } from '@/context/url-provider'
import { login } from '@/db/apiAuth'
import useFetch from '@/hooks/use-fetch'
import ErrorMessage from './error'
import { Button } from './ui/button'
import { Input } from './ui/input'
export default function Login() {
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleLogin = async () => {
    setErrors({})
    try {
      const schema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
      })

      await schema.validate(formData, { abortEarly: false })
      await fnLogin()
    } catch (e) {
      const newErrors = {}

      e?.inner?.forEach((err) => {
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
      router.push(`/dashboard${longLink ? `?createNew=${encodeURIComponent(longLink)}` : ''}`)
      fetchUser()
    }
  }, [data, error])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>to your account if you have one</CardDescription>
        {error?.message && <ErrorMessage message={error.message} />}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Input
            name="email"
            type="email"
            placeholder="Enter Email"
            className="text-neutral-300 rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500 w-full  bg-neutral-950 placeholder:text-neutral-700"
            onChange={handleInputChange}
          />
        </div>
        {errors.email && <ErrorMessage message={errors.email} />}
        <div className="space-y-1">
          <Input
            name="password"
            type="password"
            placeholder="Enter Password"
            className="text-neutral-300 rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500 w-full  bg-neutral-950 placeholder:text-neutral-700"
            onChange={handleInputChange}
          />
        </div>
        {errors.password && <ErrorMessage message={errors.password} />}
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogin}>
          {loading ? <BeatLoader size={10} color="#36d7b7" /> : 'Login'}
        </Button>
      </CardFooter>
    </Card>
  )
}
