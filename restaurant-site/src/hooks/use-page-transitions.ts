'use client'

import { motion, Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Page transition variants for admin panel navigation
 */
export const pageTransitions = {
  slideInRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  slideInLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },

  fadeSlideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },

  scaleSlide: {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 1.05, opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

/**
 * Loading transition variants
 */
export const loadingTransitions = {
  loading: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  skeleton: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity }
    }
  }
}

/**
 * Hook for managing page transitions with loading states
 */
export function usePageTransition() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const navigateWithTransition = async (path: string, delay = 150) => {
    setIsTransitioning(true)
    
    // Small delay to show transition start
    await new Promise(resolve => setTimeout(resolve, delay))
    
    router.push(path)
    
    // Reset after navigation
    setTimeout(() => setIsTransitioning(false), 400)
  }

  return {
    isTransitioning,
    navigateWithTransition
  }
}

/**
 * Animated page wrapper component
 */
export const PageTransition: React.FC<{
  children: React.ReactNode
  variant?: keyof typeof pageTransitions
  className?: string
}> = ({ children, variant = 'fadeSlideUp', className = '' }) => {
  const transition = pageTransitions[variant]
  
  return (
    <motion.div
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Loading skeleton component for page transitions
 */
export const LoadingSkeleton: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gray-200 rounded"
          variants={loadingTransitions.skeleton}
          animate="animate"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}