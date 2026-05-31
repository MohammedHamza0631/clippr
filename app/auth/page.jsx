'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect } from 'react'
import LoginFormDemo from '@/components/login-form-demo'
import SignupFormDemo from '@/components/signup-form-demo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UrlState } from '@/context/url-provider'

function AuthPageContent() {
  const searchParams = useSearchParams()
  const longLink = searchParams?.get('createNew')
  const router = useRouter()
  const { isAuthenticated, loading } = UrlState()

  useEffect(() => {
    if (isAuthenticated && !loading)
      router.push(`/dashboard?${longLink ? `createNew=${longLink}` : ''}`)
  }, [isAuthenticated, loading, router])

  return (
    <div className="mt-36 flex flex-col items-center gap-10 px-8">
      <h1 className="text-4xl md:text-5xl font-extrabold">
        {longLink ? 'Please Sign in first' : 'Login/Signup'}
      </h1>
      <Tabs defaultValue="login" className="w-[300px] md:w-[500px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginFormDemo />
        </TabsContent>
        <TabsContent value="signup">
          <SignupFormDemo />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const AuthPage = () => (
  <Suspense>
    <AuthPageContent />
  </Suspense>
)

export default AuthPage
