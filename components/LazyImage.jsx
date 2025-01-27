'use client'
import Image from 'next/image'

export default function LazyImage ({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      className='rounded-lg'
    />
  )
}
