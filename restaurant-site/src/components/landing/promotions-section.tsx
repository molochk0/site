'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { CalendarDaysIcon, ClockIcon, TagIcon, GiftIcon } from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { TouchCarousel } from '@/hooks/use-touch-gestures'
import { useCachedApi } from '@/lib/cache'
import { 
  useScrollAnimations, 
  staggerContainer, 
  staggerItem, 
  scrollRevealVariants,
  fadeInVariants
} from '@/hooks/use-scroll-animations'

export interface Promotion {
  id: string
  title: string
  description: string
  discount: number
  validFrom: Date
  validUntil: Date
  image?: string
  isActive: boolean
}

interface PromotionsProps {
  promotions?: Promotion[]
}

// Mock data for development
const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Счастливые часы',
    description: 'Скидка 30% на все напитки с 16:00 до 19:00 каждый день',
    discount: 30,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=300&fit=crop',
    isActive: true
  },
  {
    id: '2',
    title: 'Бизнес-ланч',
    description: 'Специальное предложение для бизнес-ланча: суп + основное блюдо + десерт за 850₽',
    discount: 25,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-06-30'),
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&h=300&fit=crop',
    isActive: true
  },
  {
    id: '3',
    title: 'Семейный ужин',
    description: 'При заказе от 3000₽ - скидка 15% для семей с детьми',
    discount: 15,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
    isActive: true
  },
  {
    id: '4',
    title: 'День рождения',
    description: 'Именинникам - комплимент от шефа и скидка 20% на весь заказ',
    discount: 20,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
    isActive: true
  }
]

function PromotionCard({ promotion, index }: { promotion: Promotion; index: number }) {
  const { ref: cardRef, isInView } = useScrollAnimations({ threshold: 0.2 })
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9])
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-2, 0, 2])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short'
    }).format(date)
  }

  const getDaysLeft = (endDate: Date) => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  const daysLeft = getDaysLeft(promotion.validUntil)

  return (
    <motion.div
      ref={cardRef}
      variants={staggerItem}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      whileHover={{ 
        y: -10,
        scale: 1.05,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      style={{ y, scale, rotate }}
    >
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white">
        {/* Image Section with Enhanced Hover */}
        <motion.div 
          className="relative h-48 overflow-hidden"
          whileHover="hover"
        >
          {promotion.image ? (
            <motion.div
              variants={{
                hover: { scale: 1.2, rotate: 1 }
              }}
              transition={{ duration: 0.4 }}
            >
              <OptimizedImage
                src={promotion.image}
                alt={promotion.title}
                width={500}
                height={300}
                className="object-cover w-full h-full"
                aspectRatio="landscape"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <GiftIcon className="w-16 h-16 text-amber-600" />
              </motion.div>
            </div>
          )}
          
          {/* Discount Badge with Pulse */}
          <motion.div 
            className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.1 }}
          >
            -{promotion.discount}%
          </motion.div>
          
          {/* Days Left Badge with Animation */}
          {daysLeft > 0 && daysLeft <= 30 && (
            <motion.div 
              className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
              initial={{ x: -50, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
              transition={{ delay: index * 0.1 + 0.7 }}
              animate={{
                scale: daysLeft <= 7 ? [1, 1.1, 1] : 1
              }}
              transition={{
                scale: {
                  duration: 1,
                  repeat: daysLeft <= 7 ? Infinity : 0,
                  ease: "easeInOut"
                }
              }}
            >
              {daysLeft} дн. осталось
            </motion.div>
          )}
          
          {/* Overlay with Smooth Transition */}
          <motion.div 
            className="absolute inset-0 bg-black/20"
            variants={{
              hover: { opacity: 1, backgroundColor: "rgba(0,0,0,0.4)" }
            }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        
        {/* Content with Stagger Animation */}
        <motion.div 
          className="p-6"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          <motion.div 
            className="flex items-start justify-between mb-3"
            variants={staggerItem}
          >
            <motion.h3 
              className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {promotion.title}
            </motion.h3>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <TagIcon className="w-5 h-5 text-amber-500 flex-shrink-0 ml-2" />
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-gray-600 mb-4 line-clamp-2"
            variants={staggerItem}
          >
            {promotion.description}
          </motion.p>
          
          {/* Validity Period with Icon Animation */}
          <motion.div 
            className="flex items-center justify-between text-sm text-gray-500 mb-4"
            variants={staggerItem}
          >
            <div className="flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <CalendarDaysIcon className="w-4 h-4 mr-1" />
              </motion.div>
              <span>до {formatDate(promotion.validUntil)}</span>
            </div>
            <div className="flex items-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ClockIcon className="w-4 h-4 mr-1" />
              </motion.div>
              <span>Активно</span>
            </div>
          </motion.div>
          
          {/* Action Button with Enhanced Hover */}
          <motion.div variants={staggerItem}>
            <Button 
              variant="outline" 
              className="w-full group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all duration-200"
              onClick={() => {
                // Future: Handle promotion details or booking
                console.log('Promotion selected:', promotion.id)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Воспользоваться
            </Button>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  )
}

export function PromotionsSection({ promotions: initialPromotions }: PromotionsProps) {
  // Use cached API to fetch promotions
  const { data: apiPromotions, loading, error } = useCachedApi<{ success: boolean; data: Promotion[] }>(
    '/api/promotions',
    { ttl: 5 * 60 * 1000 } // 5 minute cache
  )

  // Use API data if available, otherwise fall back to mock data or initial props
  const promotions = apiPromotions?.data || initialPromotions || mockPromotions
  const [displayedPromotions, setDisplayedPromotions] = useState(promotions.slice(0, 4))
  const [showAll, setShowAll] = useState(false)
  const { ref, isInView } = useScrollAnimations({ threshold: 0.1 })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100])

  // Update displayed promotions when data changes
  useEffect(() => {
    setDisplayedPromotions(promotions.slice(0, showAll ? promotions.length : 4))
  }, [promotions, showAll])

  const activePromotions = promotions.filter(p => p.isActive)

  const handleShowMore = () => {
    if (showAll) {
      setDisplayedPromotions(promotions.slice(0, 4))
      setShowAll(false)
    } else {
      setDisplayedPromotions(promotions)
      setShowAll(true)
    }
  }

  return (
    <section id="promotions" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          variants={fadeInVariants.fromBottom}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <GiftIcon className="w-6 h-6 text-red-500 mr-2" />
            <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
              АКЦИИ И ПРЕДЛОЖЕНИЯ
            </span>
            <GiftIcon className="w-6 h-6 text-red-500 ml-2" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            Выгодные предложения
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Воспользуйтесь нашими специальными предложениями и скидками. 
            Мы регулярно обновляем акции для наших дорогих гостей.
          </p>
        </motion.div>

        {/* Stats Bar with Parallax */}
        <motion.div
          style={{ y: backgroundY }}
          variants={scrollRevealVariants.slideUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="bg-gradient-to-r from-amber-50 to-red-50 rounded-2xl p-6 mb-12 border border-amber-100 relative overflow-hidden"
        >
          {/* Background decoration */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-8 translate-x-8"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-red-600 mb-1">
                {activePromotions.length}
              </div>
              <div className="text-gray-600 text-sm">Активных акций</div>
            </div>
            <div className="border-x border-amber-200 md:border-x-0 md:border-l md:border-r md:border-gray-200">
              <div className="text-2xl lg:text-3xl font-bold text-amber-600 mb-1">
                До 30%
              </div>
              <div className="text-gray-600 text-sm">Максимальная скидка</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">
                Каждый день
              </div>
              <div className="text-gray-600 text-sm">Новые предложения</div>
            </div>
          </div>
        </motion.div>

        {/* Promotions Grid with Mobile Carousel */}
        {activePromotions.length > 0 ? (
          <>
            {/* Desktop Grid */}
            <motion.div 
              className="hidden md:grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
            >
              {displayedPromotions.map((promotion, index) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  index={index}
                />
              ))}
            </motion.div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <TouchCarousel
                showDots={true}
                showArrows={false}
                autoPlay={true}
                autoPlayInterval={4000}
                className="w-full"
              >
                {displayedPromotions.map((promotion, index) => (
                  <div key={promotion.id} className="px-4">
                    <PromotionCard
                      promotion={promotion}
                      index={index}
                    />
                  </div>
                ))}
              </TouchCarousel>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-center py-12"
          >
            <GiftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              Акции временно недоступны
            </h3>
            <p className="text-gray-400">
              Следите за обновлениями - скоро появятся новые предложения!
            </p>
          </motion.div>
        )}

        {/* Show More/Less Button */}
        {promotions.length > 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={handleShowMore}
              className="px-8"
            >
              {showAll ? 'Показать меньше' : `Показать все акции (${promotions.length})`}
            </Button>
          </motion.div>
        )}

        {/* CTA Section with Enhanced Animation */}
        <motion.div
          variants={scrollRevealVariants.zoomIn}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 lg:p-12 text-center text-white mt-16 relative overflow-hidden"
        >
          {/* Animated background elements */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              backgroundImage: [
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <GiftIcon className="w-12 h-12 mx-auto mb-6 text-white" />
          </motion.div>
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Не пропустите новые акции!
          </h3>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Подпишитесь на нашу рассылку и узнавайте о новых акциях и специальных предложениях первыми
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 border-none focus:ring-2 focus:ring-white"
            />
            <Button 
              variant="secondary"
              className="bg-white text-amber-600 hover:bg-gray-100 px-6 py-3 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Подписаться
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}