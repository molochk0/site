'use client'

import { useState } from 'react'
import NextImage, { ImageProps } from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  className?: string
  containerClassName?: string
  showLoader?: boolean
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto'
  lazy?: boolean
  quality?: number
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  containerClassName = '',
  showLoader = true,
  aspectRatio = 'auto',
  lazy = true,
  quality = 85,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: ''
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-gray-100 text-gray-400',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}>
        <div className="text-center p-4">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Image not available</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'relative overflow-hidden',
      aspectRatioClasses[aspectRatio],
      containerClassName
    )}>
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        className={cn(
          'transition-opacity duration-300',
          isLoading && showLoader ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
      
      {isLoading && showLoader && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full"
          />
        </motion.div>
      )}
    </div>
  )
}

export function ResponsiveImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'auto',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={800}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={cn('w-full h-full object-cover', className)}
      containerClassName={containerClassName}
      aspectRatio={aspectRatio}
      {...props}
    />
  )
}

export function Avatar({
  src,
  alt,
  size = 40,
  className = '',
  fallback
}: {
  src?: string
  alt: string
  size?: number
  className?: string
  fallback?: React.ReactNode
}) {
  const [hasError, setHasError] = useState(!src)

  if (hasError || !src) {
    return (
      <div
        className={cn(
          'rounded-full bg-gray-200 flex items-center justify-center text-gray-500',
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback || <span className="text-sm font-medium">{alt[0]?.toUpperCase()}</span>}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      containerClassName="rounded-full"
      onError={() => setHasError(true)}
    />
  )
}