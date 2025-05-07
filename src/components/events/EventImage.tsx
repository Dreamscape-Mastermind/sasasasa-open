'use client'

import { useState } from 'react'
import Image from 'next/image'

interface EventImageProps {
  src: string
  alt: string
  fallbackSrc: string
}

export default function EventImage({ src, alt, fallbackSrc }: EventImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  
  return (
    <Image
      src={imgSrc}
      fill
      alt={alt}
      className="object-contain"
      sizes="(max-width: 640px) 100vw, 50vw"
      priority
      onError={() => {
        setImgSrc(fallbackSrc)
      }}
    />
  )
} 