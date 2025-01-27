import React, { forwardRef } from 'react'
import Image from 'next/image'

const LazyImage = forwardRef(({ src, alt }, ref) => (
  <Image src={src} alt={alt} width={200} height={200} className='rounded-lg' />
))

export default React.memo(LazyImage)
