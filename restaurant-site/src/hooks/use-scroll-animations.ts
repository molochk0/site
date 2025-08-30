'use client'

import { useRef, useEffect } from 'react'
import { useInView, useScroll, useTransform, MotionValue } from 'framer-motion'

/**
 * Enhanced scroll animation hook with multiple triggers and effects
 */
export function useScrollAnimations(options?: {
  threshold?: number
  triggerOnce?: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    threshold: options?.threshold || 0.1,
    once: options?.triggerOnce ?? true
  })

  return { ref, isInView }
}

/**
 * Parallax scroll effect hook
 */
export function useParallax(distance: number = 50): [React.RefObject<any>, MotionValue<string>] {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -distance])
  const yString = useTransform(y, (value) => `${value}px`)
  
  return [ref, yString]
}

/**
 * Stagger animation variants for lists
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

/**
 * Fade in from direction variants
 */
export const fadeInVariants = {
  fromLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  fromRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  fromTop: {
    hidden: { opacity: 0, y: -60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  fromBottom: {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }
}

/**
 * Advanced scroll-triggered animations
 */
export const scrollRevealVariants = {
  slideUp: {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },
  slideDown: {
    hidden: { 
      opacity: 0, 
      y: -100,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },
  slideLeft: {
    hidden: { 
      opacity: 0, 
      x: -100,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },
  slideRight: {
    hidden: { 
      opacity: 0, 
      x: 100,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },
  zoomIn: {
    hidden: { 
      opacity: 0, 
      scale: 0.5
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },
  rotate: {
    hidden: { 
      opacity: 0, 
      rotate: -10,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
}

/**
 * Counter animation hook for numbers
 */
export function useCountAnimation(
  target: number, 
  duration: number = 2000,
  isInView: boolean = false
) {
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (!isInView || !ref.current) return
    
    const element = ref.current
    const startTime = Date.now()
    const startValue = 0
    
    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      const currentValue = Math.round(startValue + (target - startValue) * easeOutExpo)
      element.textContent = currentValue.toLocaleString()
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [target, duration, isInView])
  
  return ref
}

/**
 * Typing animation effect
 */
export function useTypingAnimation(
  text: string,
  speed: number = 50,
  isInView: boolean = false
) {
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (!isInView || !ref.current) return
    
    const element = ref.current
    let currentIndex = 0
    
    const typeNextCharacter = () => {
      if (currentIndex < text.length) {
        element.textContent = text.substring(0, currentIndex + 1)
        currentIndex++
        setTimeout(typeNextCharacter, speed)
      }
    }
    
    element.textContent = ''
    typeNextCharacter()
  }, [text, speed, isInView])
  
  return ref
}