'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BarChart3,
  Globe2,
  Smartphone,
  Activity,
  Link,
  ArrowRight
} from 'lucide-react'
import { HeroGeometric } from '@/components/ui/shape-landing-hero'
import { motion } from 'framer-motion'

export default function Home () {
  const [longUrl, setLongUrl] = useState('')
  const router = useRouter()
  const handleShorten = e => {
    e.preventDefault()

    if (longUrl) {
      router.push(`/auth?createNew=${longUrl}`)
    }
  }

  const features = [
    {
      icon: <Link className='h-6 w-6 text-indigo-400' />,
      title: 'Quick URL Shortening',
      description:
        'Transform long URLs into concise, shareable links in seconds'
    },
    {
      icon: <BarChart3 className='h-6 w-6 text-rose-400' />,
      title: 'Detailed Analytics',
      description:
        'Track clicks, engagement, and performance with comprehensive dashboards'
    },
    {
      icon: <Globe2 className='h-6 w-6 text-cyan-400' />,
      title: 'Location Tracking',
      description: 'Monitor geographical distribution of your link clicks'
    },
    {
      icon: <Smartphone className='h-6 w-6 text-amber-400' />,
      title: 'Device Analytics',
      description: 'Understand your audience with device-specific insights'
    }
  ]

  return (
    <main className='min-h-screen bg-[#030303]'>
      {/* Hero Section */}
      <section className='relative'>
        <HeroGeometric
          badge='Clippr'
          title1='Shorten Links'
          title2='Track Success'
        />

        {/* URL Shortener Form */}
        <div className='absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-3xl z-20 '>
          <form
            onSubmit={handleShorten}
            className='flex flex-col items-center justify-center md:flex-row gap-4 px-4'
          >
            <input
              type='url'
              required
              placeholder='Enter your long URL here...'
              value={longUrl}
              onChange={e => setLongUrl(e.target.value)}
              className='h-12 p-4 rounded-md bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/20'
            />
            <Button
              type='submit'
              className='h-12 px-8 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
            >
              Shorten URL
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-24 px-4 relative'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 mb-4'>
              Powerful Features for Smart Link Management
            </h2>
            <p className='text-white/40 max-w-2xl mx-auto'>
              Everything you need to create, manage, and analyze your shortened
              URLs in one place
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className='p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors'
              >
                <div className='mb-4'>{feature.icon}</div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  {feature.title}
                </h3>
                <p className='text-white/40'>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24 px-4 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 blur-3xl' />
        <div className='max-w-4xl mx-auto text-center relative'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
            Ready to Optimize Your Links?
          </h2>
          <p className='text-white/40 mb-8 max-w-2xl mx-auto'>
            Join thousands of users who trust our platform for their URL
            shortening needs. Start tracking your link performance today.
          </p>
          <Button
            onClick={() => router.push('/auth')}
            className='h-12 px-8 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
          >
            Get Started Free
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>
      </section>
    </main>
  )
}
