'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  PhotoIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'

interface Event {
  id: string
  title: string
  description: string
  date: Date
  time: string
  capacity?: number
  image?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  capacity: number | undefined
  image?: string
  isPublished: boolean
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Вечер живой музыки',
    description: 'Приглашаем на уютный вечер с живой музыкой в исполнении джаз-трио. Атмосферный вечер с отличной едой и напитками.',
    date: new Date('2024-02-14T19:00:00Z'),
    time: '19:00',
    capacity: 40,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
    isPublished: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Мастер-класс от шефа',
    description: 'Узнайте секреты приготовления авторских блюд от нашего шеф-повара. Включает дегустацию и рецепты.',
    date: new Date('2024-02-20T18:00:00Z'),
    time: '18:00',
    capacity: 15,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
    isPublished: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
]

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    capacity: undefined,
    image: '',
    isPublished: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'published' | 'draft'>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Simulate API call - replace with actual API call to /api/admin/events
        await new Promise(resolve => setTimeout(resolve, 1000))
        setEvents(mockEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter(event => {
    const now = new Date()
    switch (filter) {
      case 'upcoming':
        return event.date > now
      case 'past':
        return event.date < now
      case 'published':
        return event.isPublished
      case 'draft':
        return !event.isPublished
      default:
        return true
    }
  })

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        time: event.time,
        capacity: event.capacity,
        image: event.image || '',
        isPublished: event.isPublished
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        capacity: undefined,
        image: '',
        isPublished: true
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual API call
      const url = editingEvent 
        ? `/api/admin/events/${editingEvent.id}`
        : '/api/admin/events'
      
      const method = editingEvent ? 'PUT' : 'POST'
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state (in real app, refetch from API)
      const eventDateTime = new Date(`${formData.date}T${formData.time}:00`)
      
      if (editingEvent) {
        setEvents(prev => prev.map(e => 
          e.id === editingEvent.id 
            ? { ...e, ...formData, date: eventDateTime }
            : e
        ))
      } else {
        const newEvent: Event = {
          id: Date.now().toString(),
          ...formData,
          date: eventDateTime,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setEvents(prev => [newEvent, ...prev])
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это событие?')) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleTogglePublished = async (eventId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      setEvents(prev => prev.map(e => 
        e.id === eventId ? { ...e, isPublished: !e.isPublished } : e
      ))
    } catch (error) {
      console.error('Error toggling event status:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const isPast = (date: Date) => {
    return date < new Date()
  }

  const getEventStatus = (event: Event) => {
    if (!event.isPublished) return { text: 'Черновик', color: 'gray' }
    if (isPast(event.date)) return { text: 'Завершено', color: 'gray' }
    return { text: 'Предстоящее', color: 'green' }
  }

  return (
    <AdminLayout
      title="Управление событиями"
      description="Создавайте и управляйте мероприятиями ресторана"
      breadcrumbs={[{ name: 'События' }]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <CalendarDaysIcon className="w-5 h-5" />
              <span>Всего событий: {events.length}</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <span>Опубликованных: {events.filter(e => e.isPublished).length}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все события</option>
              <option value="upcoming">Предстоящие</option>
              <option value="past">Прошедшие</option>
              <option value="published">Опубликованные</option>
              <option value="draft">Черновики</option>
            </select>
            
            <Button onClick={() => handleOpenModal()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Создать событие
            </Button>
          </div>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              {filter === 'all' ? 'Событий пока нет' : 'События не найдены'}
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Создайте первое событие для ресторана'
                : 'Попробуйте изменить фильтр или создать новое событие'
              }
            </p>
            <Button onClick={() => handleOpenModal()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Создать событие
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => {
              const status = getEventStatus(event)
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="relative h-40 bg-gray-200">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status.color === 'green' 
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {status.text}
                        </span>
                      </div>
                      
                      {event.capacity && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <UserGroupIcon className="w-3 h-3 mr-1" />
                            {event.capacity}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {event.description}
                      </p>
                      
                      {/* Date and Time */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarDaysIcon className="w-4 h-4 mr-1" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleTogglePublished(event.id)}
                          className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                            event.isPublished
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {event.isPublished ? 'Скрыть' : 'Опубликовать'}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenModal(event)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Редактировать"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Удалить"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingEvent ? 'Редактировать событие' : 'Создать событие'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Название события"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Введите название события"
            />
            
            <Textarea
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              placeholder="Опишите мероприятие"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Дата события"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              
              <Input
                label="Время начала"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
            
            <Input
              label="Количество мест"
              type="number"
              value={formData.capacity || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                capacity: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              min="1"
              placeholder="Оставьте пустым, если нет ограничений"
            />
            
            <Input
              label="Ссылка на изображение"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-900">
                Опубликовать событие
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : editingEvent ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}