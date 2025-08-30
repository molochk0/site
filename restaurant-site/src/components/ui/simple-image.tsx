'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'

interface SimpleImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
}

export function SimpleImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85
}: SimpleImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400',
        className
      )}>
        <div className="text-center p-4">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Image not available</div>
        </div>
      </div>
    )
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      priority={priority}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}