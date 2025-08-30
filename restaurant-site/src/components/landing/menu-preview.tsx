'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { LazyLoader } from '@/components/ui/lazy-loader'
import { 
  useScrollAnimations, 
  staggerContainer, 
  staggerItem, 
  scrollRevealVariants,
  fadeInVariants
} from '@/hooks/use-scroll-animations'

interface MenuCategory {
  name: string
  description: string
  image: string
  items: string[]
}

interface MenuPreviewProps {
  categories?: MenuCategory[]
  title?: string
  description?: string
}

const defaultCategories: MenuCategory[] = [
  {
    name: 'Закуски',
    description: 'Изысканные закуски для начала трапезы',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
    items: [
      'Тартар из лосося с авокадо',
      'Брускетта с томатами и базиликом',
      'Сырная тарелка с медом и орехами'
    ]
  },
  {
    name: 'Основные блюда',
    description: 'Авторские блюда от нашего шефа',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    items: [
      'Стейк рибай с трюфельным маслом',
      'Дорада в соляной корке',
      'Ризотто с морепродуктами'
    ]
  },
  {
    name: 'Десерты',
    description: 'Сладкое завершение вашего ужина',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
    items: [
      'Тирамису классический',
      'Шоколадный фондан с мороженым',
      'Панна котта с ягодами'
    ]
  },
  {
    name: 'Напитки',
    description: 'Авторские коктейли и отборные вина',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
    items: [
      'Авторские коктейли',
      'Винная карта (50+ позиций)',
      'Кофе и чай'
    ]
  }
]

export function MenuPreview({ 
  categories = defaultCategories,
  title = "Наше меню",
  description = "Откройте для себя изысканные блюда нашей кухни"
}: MenuPreviewProps) {
  const [activeCategory, setActiveCategory] = useState(0)
  const { ref, isInView } = useScrollAnimations({ threshold: 0.1 })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <section id="menu" className="py-16 lg:py-24 bg-gray-50">
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
            <SparklesIcon className="w-6 h-6 text-amber-500 mr-2" />
            <span className="text-amber-600 font-medium text-sm uppercase tracking-wide">
              НАШЕ МЕНЮ
            </span>
            <SparklesIcon className="w-6 h-6 text-amber-500 ml-2" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            {title}
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Category Navigation with Stagger */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              variants={staggerItem}
              onClick={() => setActiveCategory(index)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                activeCategory === index
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Categories Grid with Enhanced Animation */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              variants={staggerItem}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`h-full cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  activeCategory === index ? 'ring-2 ring-amber-500 shadow-lg' : ''
                }`}
                onClick={() => setActiveCategory(index)}
              >
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full"
                      aspectRatio="landscape"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-black/20" />
                  <motion.div 
                    className="absolute top-4 left-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="p-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.h3 
                    className="text-xl font-semibold text-gray-900 mb-2"
                    variants={staggerItem}
                  >
                    {category.name}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 text-sm mb-4"
                    variants={staggerItem}
                  >
                    {category.description}
                  </motion.p>
                  
                  <motion.div 
                    className="space-y-2"
                    variants={staggerContainer}
                  >
                    {category.items.slice(0, 3).map((item, itemIndex) => (
                      <motion.div 
                        key={itemIndex} 
                        className="flex items-center text-sm text-gray-700"
                        variants={staggerItem}
                      >
                        <motion.div 
                          className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2" 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: itemIndex * 0.3 }}
                        />
                        {item}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Category Details with Parallax */}
        <motion.div
          key={activeCategory}
          variants={scrollRevealVariants.slideUp}
          initial="hidden"
          animate="visible"
          style={{ y: backgroundY }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image with Enhanced Hover */}
            <motion.div 
              className="relative h-64 lg:h-96 overflow-hidden"
              whileHover="hover"
            >
              <motion.div
                variants={{
                  hover: { scale: 1.1, rotate: 1 }
                }}
                transition={{ duration: 0.6 }}
              >
                <OptimizedImage
                  src={categories[activeCategory].image}
                  alt={categories[activeCategory].name}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full"
                  aspectRatio="landscape"
                />
              </motion.div>
              <motion.div 
                className="absolute inset-0 bg-black/20"
                variants={{
                  hover: { backgroundColor: "rgba(0,0,0,0.1)" }
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            
            {/* Content with Stagger Animation */}
            <motion.div 
              className="p-8 lg:p-12 flex flex-col justify-center"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.h3 
                className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 mb-4"
                variants={staggerItem}
              >
                {categories[activeCategory].name}
              </motion.h3>
              <motion.p 
                className="text-gray-600 text-lg mb-8 leading-relaxed"
                variants={staggerItem}
              >
                {categories[activeCategory].description}
              </motion.p>
              
              <motion.div 
                className="space-y-4 mb-8"
                variants={staggerContainer}
              >
                {categories[activeCategory].items.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="flex items-center text-gray-700"
                    whileHover={{ x: 10, scale: 1.02 }}
                  >
                    <motion.div 
                      className="w-2 h-2 bg-amber-500 rounded-full mr-3" 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                    <span className="text-lg">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div variants={staggerItem}>
                <Button 
                  size="lg"
                  className="self-start"
                  onClick={() => {
                    // Future: Link to full menu page
                    console.log('View full menu')
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Посмотреть полное меню
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Chef's Special Note with Enhanced Animation */}
        <motion.div
          variants={scrollRevealVariants.zoomIn}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 lg:p-12 border border-amber-100 relative overflow-hidden"
        >
          {/* Background decoration */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-10"
            animate={{
              background: [
                "radial-gradient(circle at 20% 30%, #f59e0b 0%, transparent 50%)",
                "radial-gradient(circle at 80% 70%, #f59e0b 0%, transparent 50%)",
                "radial-gradient(circle at 20% 30%, #f59e0b 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          
          <div className="max-w-2xl mx-auto relative z-10">
            <motion.div 
              className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <SparklesIcon className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h3 
              className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              От шеф-повара
            </motion.h3>
            
            <motion.p 
              className="text-lg text-gray-700 leading-relaxed mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              "Каждое блюдо в нашем меню - это история, рассказанная через вкус. Мы используем только 
              свежайшие сезонные продукты и авторские рецепты, передающие традиции европейской кухни."
            </motion.p>
            
            <motion.div 
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <div className="font-semibold text-gray-900">Александр Петров</div>
                <div className="text-sm text-gray-600">Шеф-повар</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}