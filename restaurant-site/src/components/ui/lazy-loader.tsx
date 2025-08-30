'use client'

import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'

interface LazyLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

/**
 * Generic lazy loading wrapper with customizable fallback
 */
export function LazyLoader({ children, fallback, className = '' }: LazyLoaderProps) {
  const defaultFallback = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center justify-center p-8 ${className}`}
    >
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
        <p className="text-sm text-gray-500">Загрузка...</p>
      </div>
    </motion.div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

/**
 * Lazy loading for heavy components
 */
export function createLazyComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) {
  return lazy(importFn)
}

/**
 * Loading skeleton for cards
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-lg shadow-sm border p-6 animate-pulse"
        >
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="mt-6 h-8 bg-gray-200 rounded" />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Loading skeleton for list items
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded" />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Intersection observer hook for lazy loading
 */
import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasBeenVisible, options])

  return { elementRef, isVisible, hasBeenVisible }
}