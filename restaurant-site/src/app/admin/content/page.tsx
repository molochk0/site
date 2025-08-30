'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  HomeIcon,
  InformationCircleIcon,
  PhoneIcon,
  SparklesIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface HeroContent {
  title: string
  subtitle: string
  backgroundImage: string
  ctaText: string
  ctaLink: string
}

interface AboutContent {
  title: string
  description: string
  mission: string
  images: string[]
}

interface ContactContent {
  address: string
  phone: string
  email: string
  coordinates: {
    lat: number
    lng: number
  }
  hours: {
    [key: string]: string
  }
  socialMedia: {
    instagram?: string
    facebook?: string
    telegram?: string
  }
}

interface RestaurantInfo {
  name: string
  slogan: string
  foundedYear: number
  capacity: number
  cuisine: string
  features: string[]
}

interface ContentData {
  hero: HeroContent
  about: AboutContent
  contact: ContactContent
  restaurant_info: RestaurantInfo
}

const defaultContent: ContentData = {
  hero: {
    title: 'Добро пожаловать в "Вкусный уголок"',
    subtitle: 'Изысканная кухня в сердце города. Мы создаем незабываемые кулинарные впечатления для наших гостей.',
    backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop',
    ctaText: 'Забронировать столик',
    ctaLink: '#contact'
  },
  about: {
    title: 'О нашем ресторане',
    description: 'Ресторан "Вкусный уголок" - это место, где традиции встречаются с современностью. Наш шеф-повар создает уникальные блюда, используя только свежие сезонные продукты от лучших поставщиков.',
    mission: 'Наша миссия - создавать особенные моменты через исключительную кухню и безупречный сервис.',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop'
    ]
  },
  contact: {
    address: 'ул. Арбат, 25, Москва, 119002',
    phone: '+7 (495) 123-45-67',
    email: 'info@vkusnyy-ugolok.ru',
    coordinates: {
      lat: 55.7522,
      lng: 37.5927
    },
    hours: {
      'Понедельник': '12:00 - 23:00',
      'Вторник': '12:00 - 23:00',
      'Среда': '12:00 - 23:00',
      'Четверг': '12:00 - 23:00',
      'Пятница': '12:00 - 01:00',
      'Суббота': '12:00 - 01:00',
      'Воскресенье': '12:00 - 23:00'
    },
    socialMedia: {
      instagram: 'https://instagram.com/vkusnyy_ugolok',
      facebook: 'https://facebook.com/vkusnyyugolok',
      telegram: 'https://t.me/vkusnyy_ugolok'
    }
  },
  restaurant_info: {
    name: 'Вкусный уголок',
    slogan: 'Где каждое блюдо - это история',
    foundedYear: 2015,
    capacity: 80,
    cuisine: 'Современная европейская кухня',
    features: [
      'Авторское меню от шефа',
      'Свежие сезонные продукты',
      'Винная карта из 100+ позиций',
      'Живая музыка по выходным',
      'Возможность проведения банкетов',
      'Парковка для гостей'
    ]
  }
}

interface ContentSectionProps {
  title: string
  description: string
  icon: React.ElementType
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  hasChanges?: boolean
  onSave?: () => void
  onReset?: () => void
  isSaving?: boolean
}

const ContentSection = ({ 
  title, 
  description, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  children, 
  hasChanges = false,
  onSave,
  onReset,
  isSaving = false
}: ContentSectionProps) => {
  return (
    <Card className="overflow-hidden">
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            {hasChanges && (
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && isExpanded && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReset?.()
                  }}
                  disabled={isSaving}
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Отменить
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSave?.()
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    'Сохранение...'
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Сохранить
                    </>
                  )}
                </Button>
              </div>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
      
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      </motion.div>
    </Card>
  )
}

export default function ContentManager() {
  const [content, setContent] = useState<ContentData>(defaultContent)
  const [originalContent, setOriginalContent] = useState<ContentData>(defaultContent)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})
  const [savingStates, setSavingStates] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Simulate API call - replace with actual API call to /api/admin/content
        await new Promise(resolve => setTimeout(resolve, 1000))
        // In real implementation, fetch from API and set content
        setOriginalContent(defaultContent)
        setContent(defaultContent)
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const hasChanges = (section: keyof ContentData) => {
    return JSON.stringify(content[section]) !== JSON.stringify(originalContent[section])
  }

  const handleSave = async (section: keyof ContentData) => {
    setSavingStates(prev => ({ ...prev, [section]: true }))
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update original content after successful save
      setOriginalContent(prev => ({
        ...prev,
        [section]: content[section]
      }))
      
      console.log(`Saved ${section} content:`, content[section])
    } catch (error) {
      console.error(`Error saving ${section} content:`, error)
    } finally {
      setSavingStates(prev => ({ ...prev, [section]: false }))
    }
  }

  const handleReset = (section: keyof ContentData) => {
    setContent(prev => ({
      ...prev,
      [section]: originalContent[section]
    }))
  }

  const updateHero = (field: keyof HeroContent, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }))
  }

  const updateAbout = (field: keyof AboutContent, value: string | string[]) => {
    setContent(prev => ({
      ...prev,
      about: { ...prev.about, [field]: value }
    }))
  }

  const updateContact = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }))
  }

  const updateRestaurantInfo = (field: keyof RestaurantInfo, value: any) => {
    setContent(prev => ({
      ...prev,
      restaurant_info: { ...prev.restaurant_info, [field]: value }
    }))
  }

  if (isLoading) {
    return (
      <AdminLayout
        title="Управление контентом"
        description="Редактирование содержимого веб-сайта"
        breadcrumbs={[{ name: 'Контент' }]}
      >
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Управление контентом"
      description="Редактирование содержимого веб-сайта"
      breadcrumbs={[{ name: 'Контент' }]}
    >
      <div className="space-y-6">
        {/* Hero Section */}
        <ContentSection
          title="Главная секция (Hero)"
          description="Редактирование главного баннера сайта"
          icon={HomeIcon}
          isExpanded={expandedSections.hero}
          onToggle={() => toggleSection('hero')}
          hasChanges={hasChanges('hero')}
          onSave={() => handleSave('hero')}
          onReset={() => handleReset('hero')}
          isSaving={savingStates.hero}
        >
          <div className="space-y-4 mt-4">
            <Input
              label="Заголовок"
              value={content.hero.title}
              onChange={(e) => updateHero('title', e.target.value)}
              placeholder="Основной заголовок"
            />
            
            <Textarea
              label="Подзаголовок"
              value={content.hero.subtitle}
              onChange={(e) => updateHero('subtitle', e.target.value)}
              rows={3}
              placeholder="Описание под заголовком"
            />
            
            <Input
              label="Фоновое изображение"
              value={content.hero.backgroundImage}
              onChange={(e) => updateHero('backgroundImage', e.target.value)}
              placeholder="URL изображения"
            />
            
            <Input
              label="Текст кнопки"
              value={content.hero.ctaText}
              onChange={(e) => updateHero('ctaText', e.target.value)}
              placeholder="Текст призыва к действию"
            />
            
            <Input
              label="Ссылка кнопки"
              value={content.hero.ctaLink}
              onChange={(e) => updateHero('ctaLink', e.target.value)}
              placeholder="#section или /page"
            />
          </div>
        </ContentSection>

        {/* About Section */}
        <ContentSection
          title="О ресторане"
          description="Редактирование информации о ресторане"
          icon={InformationCircleIcon}
          isExpanded={expandedSections.about}
          onToggle={() => toggleSection('about')}
          hasChanges={hasChanges('about')}
          onSave={() => handleSave('about')}
          onReset={() => handleReset('about')}
          isSaving={savingStates.about}
        >
          <div className="space-y-4 mt-4">
            <Input
              label="Заголовок секции"
              value={content.about.title}
              onChange={(e) => updateAbout('title', e.target.value)}
            />
            
            <Textarea
              label="Описание ресторана"
              value={content.about.description}
              onChange={(e) => updateAbout('description', e.target.value)}
              rows={4}
            />
            
            <Textarea
              label="Миссия ресторана"
              value={content.about.mission}
              onChange={(e) => updateAbout('mission', e.target.value)}
              rows={2}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Изображения (по одному URL на строке)
              </label>
              <Textarea
                value={content.about.images.join('\n')}
                onChange={(e) => updateAbout('images', e.target.value.split('\n').filter(url => url.trim()))}
                rows={3}
                placeholder="https://example.com/image1.jpg"
              />
            </div>
          </div>
        </ContentSection>

        {/* Contact Section */}
        <ContentSection
          title="Контактная информация"
          description="Редактирование контактов и часов работы"
          icon={PhoneIcon}
          isExpanded={expandedSections.contact}
          onToggle={() => toggleSection('contact')}
          hasChanges={hasChanges('contact')}
          onSave={() => handleSave('contact')}
          onReset={() => handleReset('contact')}
          isSaving={savingStates.contact}
        >
          <div className="space-y-4 mt-4">
            <Input
              label="Адрес"
              value={content.contact.address}
              onChange={(e) => updateContact('address', e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Телефон"
                value={content.contact.phone}
                onChange={(e) => updateContact('phone', e.target.value)}
              />
              
              <Input
                label="Email"
                type="email"
                value={content.contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Широта"
                type="number"
                step="any"
                value={content.contact.coordinates.lat}
                onChange={(e) => updateContact('coordinates', { 
                  ...content.contact.coordinates, 
                  lat: parseFloat(e.target.value) 
                })}
              />
              
              <Input
                label="Долгота"
                type="number"
                step="any"
                value={content.contact.coordinates.lng}
                onChange={(e) => updateContact('coordinates', { 
                  ...content.contact.coordinates, 
                  lng: parseFloat(e.target.value) 
                })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Часы работы
              </label>
              <div className="space-y-2">
                {Object.entries(content.contact.hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <span className="w-24 text-sm text-gray-600">{day}:</span>
                    <Input
                      value={hours}
                      onChange={(e) => updateContact('hours', {
                        ...content.contact.hours,
                        [day]: e.target.value
                      })}
                      placeholder="12:00 - 23:00"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Социальные сети
              </label>
              <div className="space-y-2">
                <Input
                  label="Instagram"
                  value={content.contact.socialMedia.instagram || ''}
                  onChange={(e) => updateContact('socialMedia', {
                    ...content.contact.socialMedia,
                    instagram: e.target.value
                  })}
                  placeholder="https://instagram.com/username"
                />
                
                <Input
                  label="Facebook"
                  value={content.contact.socialMedia.facebook || ''}
                  onChange={(e) => updateContact('socialMedia', {
                    ...content.contact.socialMedia,
                    facebook: e.target.value
                  })}
                  placeholder="https://facebook.com/page"
                />
                
                <Input
                  label="Telegram"
                  value={content.contact.socialMedia.telegram || ''}
                  onChange={(e) => updateContact('socialMedia', {
                    ...content.contact.socialMedia,
                    telegram: e.target.value
                  })}
                  placeholder="https://t.me/channel"
                />
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Restaurant Info */}
        <ContentSection
          title="Информация о ресторане"
          description="Общие сведения и особенности ресторана"
          icon={SparklesIcon}
          isExpanded={expandedSections.restaurant_info}
          onToggle={() => toggleSection('restaurant_info')}
          hasChanges={hasChanges('restaurant_info')}
          onSave={() => handleSave('restaurant_info')}
          onReset={() => handleReset('restaurant_info')}
          isSaving={savingStates.restaurant_info}
        >
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Название ресторана"
                value={content.restaurant_info.name}
                onChange={(e) => updateRestaurantInfo('name', e.target.value)}
              />
              
              <Input
                label="Слоган"
                value={content.restaurant_info.slogan}
                onChange={(e) => updateRestaurantInfo('slogan', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Год основания"
                type="number"
                value={content.restaurant_info.foundedYear}
                onChange={(e) => updateRestaurantInfo('foundedYear', parseInt(e.target.value))}
              />
              
              <Input
                label="Вместимость (мест)"
                type="number"
                value={content.restaurant_info.capacity}
                onChange={(e) => updateRestaurantInfo('capacity', parseInt(e.target.value))}
              />
              
              <Input
                label="Тип кухни"
                value={content.restaurant_info.cuisine}
                onChange={(e) => updateRestaurantInfo('cuisine', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Особенности ресторана (по одной на строке)
              </label>
              <Textarea
                value={content.restaurant_info.features.join('\n')}
                onChange={(e) => updateRestaurantInfo('features', e.target.value.split('\n').filter(f => f.trim()))}
                rows={6}
                placeholder="Авторское меню от шефа\nСвежие сезонные продукты\n..."
              />
            </div>
          </div>
        </ContentSection>
      </div>
    </AdminLayout>
  )
}