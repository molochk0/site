'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import NextImage from 'next/image'

interface TouchGestureConfig {
  threshold?: number
  swipeConfidenceThreshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  disabled?: boolean
}

/**
 * Hook for handling touch gestures on mobile devices
 */
export function useTouchGestures({
  threshold = 50,
  swipeConfidenceThreshold = 10000,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  disabled = false
}: TouchGestureConfig = {}) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (disabled) return

    const swipe = swipePower(info.offset.x, info.velocity.x)

    if (swipe < -swipeConfidenceThreshold && onSwipeLeft) {
      onSwipeLeft()
    } else if (swipe > swipeConfidenceThreshold && onSwipeRight) {
      onSwipeRight()
    }

    x.set(0)
  }, [disabled, onSwipeLeft, onSwipeRight, swipeConfidenceThreshold, x])

  const handleTap = useCallback(() => {
    if (disabled) return
    onTap?.()
  }, [disabled, onTap])

  return {
    drag: disabled ? false : 'x' as const,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 1,
    onDragEnd: handleDragEnd,
    onTap: handleTap,
    style: { x, opacity }
  }
}

/**
 * Calculate swipe power based on offset and velocity
 */
function swipePower(offset: number, velocity: number): number {
  return Math.abs(offset) * velocity
}

/**
 * Carousel component with touch gesture support
 */
interface CarouselProps {
  children: React.ReactNode[]
  className?: string
  showDots?: boolean
  showArrows?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function TouchCarousel({
  children,
  className = '',
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 3000
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return prevIndex === children.length - 1 ? 0 : prevIndex + 1
      } else {
        return prevIndex === 0 ? children.length - 1 : prevIndex - 1
      }
    })
  }, [children.length])

  // Auto play functionality
  const startAutoPlay = useCallback(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(() => {
        paginate(1)
      }, autoPlayInterval)
    }
  }, [autoPlay, autoPlayInterval, paginate])

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }, [])

  const touchGestures = useTouchGestures({
    onSwipeLeft: () => paginate(1),
    onSwipeRight: () => paginate(-1),
    swipeConfidenceThreshold
  })

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          {...touchGestures}
          className="w-full"
        >
          {children[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {showArrows && children.length > 1 && (
        <>
          <motion.button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-10"
            onClick={() => paginate(-1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-10"
            onClick={() => paginate(1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && children.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {children.map((_, index) => (
            <motion.button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-amber-500' : 'bg-gray-300'
              }`}
              onClick={() => {
                const newDirection = index > currentIndex ? 1 : -1
                setDirection(newDirection)
                setCurrentIndex(index)
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Gallery component with touch gestures and zoom
 */
interface GalleryProps {
  images: Array<{ src: string; alt: string; title?: string }>
  className?: string
}

export function TouchGallery({ images, className = '' }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [scale, setScale] = useState(1)

  const handleImageSelect = (index: number) => {
    setSelectedImage(index)
    setScale(1)
  }

  const handleClose = () => {
    setSelectedImage(null)
    setScale(1)
  }

  const handleNextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length)
      setScale(1)
    }
  }

  const handlePrevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
      setScale(1)
    }
  }

  const zoomGestures = useTouchGestures({
    onTap: () => {
      setScale(scale === 1 ? 2 : 1)
    }
  })

  const navigationGestures = useTouchGestures({
    onSwipeLeft: handleNextImage,
    onSwipeRight: handlePrevImage,
    disabled: scale > 1
  })

  return (
    <>
      {/* Gallery Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleImageSelect(index)}
          >
            <NextImage
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={handleClose}
          >
            <motion.div
              className="relative max-w-screen-lg max-h-screen-lg"
              onClick={(e) => e.stopPropagation()}
              {...navigationGestures}
            >
              <NextImage
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                style={{ 
                  transform: `scale(${scale})`,
                  transition: 'transform 0.3s ease'
                }}
                onClick={() => setScale(scale === 1 ? 2 : 1)}
              />

              {/* Navigation Arrows */}
              <motion.button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                onClick={handlePrevImage}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <motion.button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                onClick={handleNextImage}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Close Button */}
              <motion.button
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
                onClick={handleClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Image Info */}
              {images[selectedImage].title && (
                <motion.div
                  className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold">{images[selectedImage].title}</h3>
                </motion.div>
              )}

              {/* Zoom Indicator */}
              {scale > 1 && (
                <motion.div
                  className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {Math.round(scale * 100)}%
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}