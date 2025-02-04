'use client'
import Login from '@/components/login'
import Signup from '@/components/signup'
import SignupFormDemo from '@/components/signup-form-demo'
import LoginFormDemo from '@/components/login-form-demo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useEffect } from 'react'
import { UrlState } from '@/context/url-provider'
import { useSearchParams, useRouter } from 'next/navigation'
const AuthPage = () => {
  const searchParams = useSearchParams()
  const longLink = searchParams?.get('createNew')
  const router = useRouter()
  const { isAuthenticated, loading } = UrlState()

  useEffect(() => {
    if (isAuthenticated && !loading)
      router.push(`/dashboard?${longLink ? `createNew=${longLink}` : ''}`)
  }, [isAuthenticated, loading, router])
  return (
    <div className='mt-36 flex flex-col items-center gap-10 px-8'>
      <h1 className='text-4xl md:text-5xl font-extrabold'>
        {longLink ? 'Please Sign in first' : 'Login/Signup'}
      </h1>
      <Tabs defaultValue='login' className='w-[300px] md:w-[500px]'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='login'>Login</TabsTrigger>
          <TabsTrigger value='signup'>Signup</TabsTrigger>
        </TabsList>
        <TabsContent value='login'>
          <LoginFormDemo />
        </TabsContent>
        <TabsContent value='signup'>
          <SignupFormDemo />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AuthPage
