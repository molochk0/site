'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PlayIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { SimpleImage } from '@/components/ui/simple-image'
import { useCountAnimation, fadeInVariants } from '@/hooks/use-scroll-animations'

interface HeroContent {
  title: string
  subtitle: string
  backgroundImage: string
  ctaText: string
  ctaLink: string
}

interface HeroSectionProps {
  content?: HeroContent
}

const defaultContent: HeroContent = {
  title: 'Добро пожаловать в "Вкусный уголок"',
  subtitle: 'Изысканная кухня в сердце города. Мы создаем незабываемые кулинарные впечатления для наших гостей.',
  backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop',
  ctaText: 'Забронировать столик',
  ctaLink: '#contact'
}

export function HeroSection({ content = defaultContent }: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  const experienceCountRef = useCountAnimation(9, 2000, isLoaded)
  const dishesCountRef = useCountAnimation(100, 2500, isLoaded)
  const guestsCountRef = useCountAnimation(50000, 3000, isLoaded)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToNext = () => {
    const nextSection = document.querySelector('#menu')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <SimpleImage
          src={content.backgroundImage}
          alt="Restaurant interior"
          width={1920}
          height={1080}
          className="object-cover scale-110 w-full h-full"
          priority
          quality={90}
        />
        {/* Overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/40" 
          style={{ opacity }}
        />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
        style={{ opacity }}
      >
        <motion.div
          variants={fadeInVariants.fromBottom}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="space-y-6 lg:space-y-8"
        >
          {/* Restaurant Name Badge */}
          <motion.div
            variants={fadeInVariants.scale}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-sm font-medium tracking-wide">FINE DINING EXPERIENCE</span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={fadeInVariants.fromBottom}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ delay: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-tight"
          >
            {content.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInVariants.fromBottom}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ delay: 0.6 }}
            className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            {content.subtitle}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={fadeInVariants.fromBottom}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection(content.ctaLink)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              {content.ctaText}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => scrollToSection('#menu')}
              className="text-white border-white/30 hover:bg-white/10 px-8 py-3 text-lg font-semibold backdrop-blur-sm"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Посмотреть меню
            </Button>
          </motion.div>

          {/* Stats with Counter Animation */}
          <motion.div
            variants={fadeInVariants.fromBottom}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            transition={{ delay: 1.0 }}
            className="grid grid-cols-3 gap-8 pt-12 lg:pt-16"
          >
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl lg:text-3xl font-bold font-serif" ref={experienceCountRef}>0</div>
              <div className="text-sm lg:text-base text-white/80 mt-1">+ лет опыта</div>
            </motion.div>
            <motion.div 
              className="text-center border-x border-white/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl lg:text-3xl font-bold font-serif" ref={dishesCountRef}>0</div>
              <div className="text-sm lg:text-base text-white/80 mt-1">+ блюд в меню</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl lg:text-3xl font-bold font-serif" ref={guestsCountRef}>0</div>
              <div className="text-sm lg:text-base text-white/80 mt-1">+ довольных гостей</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        variants={fadeInVariants.fromBottom}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        transition={{ delay: 1.2 }}
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 hover:text-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Листайте вниз</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDownIcon className="w-6 h-6" />
          </motion.div>
        </div>
      </motion.button>

      {/* Decorative Elements with Float Animation */}
      <motion.div 
        className="absolute top-20 left-10 w-20 h-20 border border-white/10 rounded-full hidden lg:block" 
        animate={{ 
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-32 right-16 w-16 h-16 border border-white/10 rounded-full hidden lg:block" 
        animate={{ 
          y: [0, 15, 0],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div 
        className="absolute top-1/3 right-8 w-2 h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden lg:block" 
        animate={{ 
          scaleY: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
    </section>
  )
}