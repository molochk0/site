'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  PhoneIcon, 
  MapPinIcon, 
  EnvelopeIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TouchGallery } from '@/hooks/use-touch-gestures'

interface AboutContent {
  title: string
  description: string
  mission: string
  images: Array<{ src: string; alt: string; title?: string }>
}

interface ContactInfo {
  address: string
  phone: string
  email: string
  hours: Record<string, string>
  coordinates?: {
    lat: number
    lng: number
  }
  socialMedia?: {
    instagram?: string
    facebook?: string
    telegram?: string
  }
}

interface RestaurantFeature {
  icon: React.ElementType
  title: string
  description: string
}

const defaultAbout: AboutContent = {
  title: 'О нашем ресторане',
  description: 'Ресторан "Вкусный уголок" - это место, где традиции встречаются с современностью. Наш шеф-повар создает уникальные блюда, используя только свежие сезонные продукты от лучших поставщиков. Мы предлагаем нашим гостям не просто еду, а настоящее гастрономическое путешествие.',
  mission: 'Наша миссия - создавать особенные моменты через исключительную кухню и безупречный сервис.',
  images: [
    {
      src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
      alt: 'Restaurant interior',
      title: 'Главный зал ресторана'
    },
    {
      src: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=400&fit=crop',
      alt: 'Kitchen view',
      title: 'Открытая кухня'
    },
    {
      src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop',
      alt: 'Chef at work',
      title: 'Наш шеф-повар за работой'
    },
    {
      src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
      alt: 'Bar area',
      title: 'Барная зона'
    }
  ]
}

const defaultContact: ContactInfo = {
  address: 'ул. Арбат, 25, Москва, 119002',
  phone: '+7 (495) 123-45-67',
  email: 'info@vkusnyy-ugolok.ru',
  hours: {
    'Понедельник': '12:00 - 23:00',
    'Вторник': '12:00 - 23:00', 
    'Среда': '12:00 - 23:00',
    'Четверг': '12:00 - 23:00',
    'Пятница': '12:00 - 01:00',
    'Суббота': '12:00 - 01:00',
    'Воскресенье': '12:00 - 23:00'
  },
  coordinates: {
    lat: 55.7522,
    lng: 37.5927
  },
  socialMedia: {
    instagram: 'https://instagram.com/vkusnyy_ugolok',
    facebook: 'https://facebook.com/vkusnyyugolok',
    telegram: 'https://t.me/vkusnyy_ugolok'
  }
}

const restaurantFeatures: RestaurantFeature[] = [
  {
    icon: StarIcon,
    title: 'Авторское меню',
    description: 'Уникальные рецепты от нашего шеф-повара с использованием сезонных продуктов'
  },
  {
    icon: UserGroupIcon,
    title: 'Профессиональная команда',
    description: 'Опытные повара и внимательный персонал для безупречного сервиса'
  },
  {
    icon: BuildingStorefrontIcon,
    title: 'Уютная атмосфера',
    description: 'Элегантный интерьер и комфортная обстановка для любого случая'
  },
  {
    icon: HeartIcon,
    title: 'Индивидуальный подход',
    description: 'Персональное внимание к каждому гостю и особым пожеланиям'
  }
]

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  date?: string
  guests?: number
}

export function AboutSection({ content = defaultAbout }: { content?: AboutContent }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="about" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center mb-4">
                <HeartIcon className="w-6 h-6 text-amber-500 mr-2" />
                <span className="text-amber-600 font-medium text-sm uppercase tracking-wide">
                  О НАС
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
                {content.title}
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {content.description}
              </p>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                <p className="text-lg font-medium text-gray-800 italic">
                  "{content.mission}"
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold font-serif text-amber-600 mb-2">9+</div>
                <div className="text-gray-600">Лет опыта</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-serif text-amber-600 mb-2">50K+</div>
                <div className="text-gray-600">Довольных гостей</div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {restaurantFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <feature.icon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Images Gallery with Touch Support */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Атмосфера ресторана</h3>
              <p className="text-gray-600 mb-4">Посмотрите на наши интерьеры и атмосферу. Нажмите на фото для детального просмотра.</p>
              <TouchGallery 
                images={content.images}
                className="mb-6"
              />
            </div>
            
            {/* Chef Quote */}
            <div className="bg-gray-900 text-white p-6 rounded-lg">
              <p className="text-lg italic mb-4">
                "Кулинария - это искусство создавать счастье через вкус"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">АП</span>
                </div>
                <div>
                  <div className="font-semibold">Александр Петров</div>
                  <div className="text-sm text-gray-300">Шеф-повар</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function ContactSection({ contact = defaultContact }: { contact?: ContactInfo }) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    date: '',
    guests: 2
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Future: Implement actual form submission
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', message: '', date: '', guests: 2 })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <section id="contact" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <MapPinIcon className="w-6 h-6 text-green-500 mr-2" />
            <span className="text-green-600 font-medium text-sm uppercase tracking-wide">
              КОНТАКТЫ И БРОНИРОВАНИЕ
            </span>
            <MapPinIcon className="w-6 h-6 text-green-500 ml-2" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            Свяжитесь с нами
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Забронируйте столик или задайте вопрос. Мы всегда рады помочь и создать 
            для вас незабываемый вечер.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Details */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Контактная информация</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Адрес</div>
                    <div className="text-gray-600">{contact.address}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <PhoneIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Телефон</div>
                    <a href={`tel:${contact.phone}`} className="text-gray-600 hover:text-green-600">
                      {contact.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <a href={`mailto:${contact.email}`} className="text-gray-600 hover:text-green-600">
                      {contact.email}
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            {/* Working Hours */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <ClockIcon className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Часы работы</h3>
              </div>
              
              <div className="space-y-2">
                {Object.entries(contact.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-gray-600">{day}:</span>
                    <span className="font-medium text-gray-900">{hours}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Бронирование столика</h3>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800">
                    Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.
                  </p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">
                    Произошла ошибка. Пожалуйста, попробуйте еще раз или позвоните нам.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Ваше имя"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                    placeholder="Введите ваше имя"
                  />
                  
                  <Input
                    label="Телефон"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    required
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  placeholder="your@email.com"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Дата посещения"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange('date')}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  
                  <Input
                    label="Количество гостей"
                    type="number"
                    value={formData.guests?.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                    min="1"
                    max="20"
                    placeholder="2"
                  />
                </div>
                
                <Textarea
                  label="Сообщение"
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  placeholder="Расскажите о ваших пожеланиях, особых случаях или диетических ограничениях"
                  rows={4}
                />
                
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Забронировать столик'}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}