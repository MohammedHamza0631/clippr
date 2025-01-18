'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Home () {
  const [longUrl, setLongUrl] = useState("")
  const router = useRouter()
  const handleShorten = e => {
    e.preventDefault()

    if (longUrl) {
      router.push(`/auth?createNew=${longUrl}`)
    }
  }
  return (
    <div className='h-[30rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased'>
      <h1 className='text-3xl sm:text-5xl md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500  text-center font-sans font-bold max-w-4xl mx-auto p-4'>
        The only URL shortener you&rsquo;ll ever need!
      </h1>
      <div className=''>
        <form onSubmit={handleShorten} className='flex flex-col md:flex-row max-w-2xl mx-auto p-4 gap-4'>
          <input
            type='url'
            placeholder='Enter your looong URL!!'
            value={longUrl}
            onChange={e => setLongUrl(e.target.value)}
            className='rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500 w-full  bg-neutral-950 placeholder:text-neutral-700 placeholder:p-1'
          />
          <Button type='submit'>Shorten</Button>
        </form>
      </div>
    </div>
  )
}
