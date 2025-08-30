'use client'

import { useState, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  MusicalNoteIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { TouchCarousel } from '@/hooks/use-touch-gestures'
import { 
  useScrollAnimations, 
  staggerContainer, 
  staggerItem, 
  scrollRevealVariants,
  fadeInVariants
} from '@/hooks/use-scroll-animations'

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  time: string
  capacity?: number
  image?: string
  isPublished: boolean
}

interface EventsProps {
  events?: Event[]
}

// Mock data for development
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Вечер живой музыки',
    description: 'Приглашаем на уютный вечер с живой музыкой в исполнении джаз-трио. Атмосферный вечер с отличной едой и напитками.',
    date: new Date('2024-02-14T19:00:00Z'),
    time: '19:00',
    capacity: 40,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
    isPublished: true
  },
  {
    id: '2',
    title: 'Мастер-класс от шефа',
    description: 'Узнайте секреты приготовления авторских блюд от нашего шеф-повара. Включает дегустацию и рецепты.',
    date: new Date('2024-02-20T18:00:00Z'),
    time: '18:00',
    capacity: 15,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop',
    isPublished: true
  },
  {
    id: '3',
    title: 'Винная дегустация',
    description: 'Дегустация эксклюзивных вин от лучших виноделен. Сомелье расскажет об особенностях каждого вина.',
    date: new Date('2024-03-05T20:00:00Z'),
    time: '20:00',
    capacity: 25,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=300&fit=crop',
    isPublished: true
  },
  {
    id: '4',
    title: 'Романтический ужин',
    description: 'Специальный вечер для влюбленных пар с особенным меню и живой музыкой. Бронирование обязательно.',
    date: new Date('2024-03-14T19:30:00Z'),
    time: '19:30',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&h=300&fit=crop',
    isPublished: true
  }
]

function getEventIcon(title: string) {
  if (title.toLowerCase().includes('музыка')) return MusicalNoteIcon
  if (title.toLowerCase().includes('мастер-класс')) return AcademicCapIcon
  if (title.toLowerCase().includes('романтический')) return HeartIcon
  if (title.toLowerCase().includes('винная')) return SparklesIcon
  return CalendarIcon
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const { ref: cardRef, isInView } = useScrollAnimations({ threshold: 0.2 })
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-1, 0, 1])
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date)
  }

  const isUpcoming = event.date > new Date()
  const isPastEvent = event.date < new Date()
  const IconComponent = getEventIcon(event.title)

  return (
    <motion.div
      ref={cardRef}
      variants={staggerItem}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      style={{ y, rotate }}
      whileHover={{ 
        y: -15,
        scale: 1.03,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
    >
      <Card className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
        isPastEvent ? 'opacity-75' : 'bg-white'
      }`}>
        {/* Image Section with Enhanced Animation */}
        <motion.div 
          className="relative h-48 overflow-hidden"
          whileHover="hover"
        >
          {event.image ? (
            <motion.div
              variants={{
                hover: { scale: 1.15, rotate: 2 }
              }}
              transition={{ duration: 0.6 }}
            >
              <OptimizedImage
                src={event.image}
                alt={event.title}
                width={500}
                height={300}
                className="object-cover w-full h-full"
                aspectRatio="landscape"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <IconComponent className="w-16 h-16 text-blue-600" />
              </motion.div>
            </div>
          )}
          
          {/* Status Badge with Animation */}
          <motion.div 
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
              isPastEvent 
                ? 'bg-gray-500 text-white' 
                : isUpcoming 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 text-white'
            }`}
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
            transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.1 }}
          >
            {isPastEvent ? 'Прошедшее' : 'Предстоящее'}
          </motion.div>
          
          {/* Event Type Badge with Animation */}
          <motion.div 
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full"
            initial={{ x: -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center space-x-1">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <IconComponent className="w-4 h-4 text-blue-600" />
              </motion.div>
              <span className="text-xs font-medium text-gray-900">
                {event.title.split(' ')[0]}
              </span>
            </div>
          </motion.div>
          
          {/* Overlay with Smooth Animation */}
          <motion.div 
            className="absolute inset-0 bg-black/20"
            variants={{
              hover: { 
                backgroundColor: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(1px)"
              }
            }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
        
        {/* Content with Stagger Animation */}
        <motion.div 
          className="p-6"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          <motion.h3 
            className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3"
            variants={staggerItem}
            whileHover={{ scale: 1.02 }}
          >
            {event.title}
          </motion.h3>
          
          <motion.p 
            className="text-gray-600 mb-4 line-clamp-2"
            variants={staggerItem}
          >
            {event.description}
          </motion.p>
          
          {/* Event Details with Animated Icons */}
          <motion.div 
            className="space-y-2 mb-4"
            variants={staggerContainer}
          >
            <motion.div 
              className="flex items-center text-sm text-gray-700"
              variants={staggerItem}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
              </motion.div>
              <span>{formatDate(event.date)}</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center text-sm text-gray-700"
              variants={staggerItem}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ClockIcon className="w-4 h-4 mr-2 text-blue-500" />
              </motion.div>
              <span>Начало в {event.time}</span>
            </motion.div>
            
            {event.capacity && (
              <motion.div 
                className="flex items-center text-sm text-gray-700"
                variants={staggerItem}
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <UserGroupIcon className="w-4 h-4 mr-2 text-blue-500" />
                </motion.div>
                <span>Мест: {event.capacity}</span>
              </motion.div>
            )}
            
            <motion.div 
              className="flex items-center text-sm text-gray-700"
              variants={staggerItem}
            >
              <motion.div
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <MapPinIcon className="w-4 h-4 mr-2 text-blue-500" />
              </motion.div>
              <span>Главный зал ресторана</span>
            </motion.div>
          </motion.div>
          
          {/* Action Button with Enhanced Interaction */}
          <motion.div variants={staggerItem}>
            <Button 
              variant={isPastEvent ? "ghost" : "outline"}
              className={`w-full transition-all duration-200 ${
                !isPastEvent && 'group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500'
              }`}
              disabled={isPastEvent}
              onClick={() => {
                // Future: Handle event registration or details
                console.log('Event selected:', event.id)
              }}
              whileHover={!isPastEvent ? { scale: 1.02 } : {}}
              whileTap={!isPastEvent ? { scale: 0.98 } : {}}
            >
              {isPastEvent ? 'Мероприятие прошло' : 'Забронировать место'}
            </Button>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  )
}

export function EventsSection({ events = mockEvents }: EventsProps) {
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const { ref, isInView } = useScrollAnimations({ threshold: 0.1 })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -75])

  const publishedEvents = events.filter(e => e.isPublished)
  const now = new Date()
  
  const upcomingEvents = publishedEvents.filter(e => e.date > now)
  const pastEvents = publishedEvents.filter(e => e.date < now)
  
  const filteredEvents = 
    filterType === 'upcoming' ? upcomingEvents :
    filterType === 'past' ? pastEvents :
    publishedEvents

  return (
    <section id="events" className="py-16 lg:py-24 bg-gray-50">
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
            <CalendarIcon className="w-6 h-6 text-blue-500 mr-2" />
            <span className="text-blue-600 font-medium text-sm uppercase tracking-wide">
              СОБЫТИЯ И МЕРОПРИЯТИЯ
            </span>
            <CalendarIcon className="w-6 h-6 text-blue-500 ml-2" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            Афиша мероприятий
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Присоединяйтесь к нашим уникальным мероприятиям: от живой музыки до кулинарных 
            мастер-классов. Каждое событие создает особую атмосферу и незабываемые впечатления.
          </p>
        </motion.div>

        {/* Filter Tabs with Enhanced Animation */}
        <motion.div
          variants={scrollRevealVariants.slideUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex justify-center mb-12"
        >
          <motion.div 
            className="bg-white rounded-full p-1 shadow-lg border border-gray-200"
            whileHover={{ scale: 1.02 }}
            style={{ y: backgroundY }}
          >
            {[
              { key: 'upcoming' as const, label: 'Предстоящие', count: upcomingEvents.length },
              { key: 'all' as const, label: 'Все события', count: publishedEvents.length },
              { key: 'past' as const, label: 'Прошедшие', count: pastEvents.length }
            ].map((filter, index) => (
              <motion.button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-200 ${
                  filterType === filter.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {filter.label} ({filter.count})
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Events Grid with Mobile Carousel */}
        {filteredEvents.length > 0 ? (
          <>
            {/* Desktop Grid */}
            <motion.div 
              className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
            >
              {filteredEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                />
              ))}
            </motion.div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <TouchCarousel
                showDots={true}
                showArrows={false}
                autoPlay={filteredEvents.some(e => e.date > new Date())}
                autoPlayInterval={5000}
                className="w-full"
              >
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="px-4">
                    <EventCard
                      event={event}
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
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              {filterType === 'upcoming' && 'Предстоящих событий нет'}
              {filterType === 'past' && 'Прошедших событий нет'}
              {filterType === 'all' && 'События не найдены'}
            </h3>
            <p className="text-gray-400">
              {filterType === 'upcoming' && 'Следите за обновлениями - скоро появятся новые мероприятия!'}
              {filterType === 'past' && 'История мероприятий пока пуста'}
              {filterType === 'all' && 'Мероприятия будут добавлены в ближайшее время'}
            </p>
          </motion.div>
        )}

        {/* Upcoming Event Highlight with Enhanced Animation */}
        {upcomingEvents.length > 0 && filterType !== 'past' && (
          <motion.div
            variants={scrollRevealVariants.zoomIn}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mt-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden shadow-lg border border-blue-100 relative"
          >
            {/* Animated background decoration */}
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-8 translate-x-8"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
              {/* Image with Enhanced Hover */}
              <motion.div 
                className="relative h-64 lg:h-auto overflow-hidden"
                whileHover="hover"
              >
                <motion.div
                  variants={{
                    hover: { scale: 1.1 }
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src={upcomingEvents[0].image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop'}
                    alt={upcomingEvents[0].title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <motion.div 
                  className="absolute inset-0 bg-black/30"
                  variants={{
                    hover: { backgroundColor: "rgba(0,0,0,0.2)" }
                  }}
                />
                <motion.div 
                  className="absolute top-6 left-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-sm font-semibold text-gray-900">Ближайшее событие</span>
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 mb-4">
                  {upcomingEvents[0].title}
                </h3>
                
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {upcomingEvents[0].description}
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-gray-700">
                    <CalendarIcon className="w-5 h-5 mr-3 text-blue-500" />
                    <span className="text-lg">
                      {new Intl.DateTimeFormat('ru-RU', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      }).format(upcomingEvents[0].date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <ClockIcon className="w-5 h-5 mr-3 text-blue-500" />
                    <span className="text-lg">Начало в {upcomingEvents[0].time}</span>
                  </div>
                  
                  {upcomingEvents[0].capacity && (
                    <div className="flex items-center text-gray-700">
                      <UserGroupIcon className="w-5 h-5 mr-3 text-blue-500" />
                      <span className="text-lg">Осталось мест: {upcomingEvents[0].capacity}</span>
                    </div>
                  )}
                </div>
                
                <Button size="lg" className="self-start">
                  Забронировать место
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white mt-16"
        >
          <SparklesIcon className="w-12 h-12 mx-auto mb-6 text-white" />
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Не пропустите наши мероприятия!
          </h3>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Подпишитесь на уведомления о новых событиях и будьте первыми, кто узнает о предстоящих мероприятиях
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 border-none focus:ring-2 focus:ring-white"
            />
            <Button 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 font-semibold"
            >
              Подписаться
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}