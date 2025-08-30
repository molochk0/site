'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  CalendarIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'

interface Promotion {
  id: string
  title: string
  description: string
  discount: number
  validFrom: Date
  validUntil: Date
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface PromotionFormData {
  title: string
  description: string
  discount: number
  validFrom: string
  validUntil: string
  image?: string
  isActive: boolean
}

const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Счастливые часы',
    description: 'Скидка 30% на все напитки с 16:00 до 19:00 каждый день',
    discount: 30,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Бизнес-ланч',
    description: 'Специальное предложение для бизнес-ланча: суп + основное блюдо + десерт за 850₽',
    discount: 25,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-06-30'),
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  }
]

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState<PromotionFormData>({
    title: '',
    description: '',
    discount: 0,
    validFrom: '',
    validUntil: '',
    image: '',
    isActive: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        // Simulate API call - replace with actual API call to /api/admin/promotions
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPromotions(mockPromotions)
      } catch (error) {
        console.error('Error fetching promotions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  const handleOpenModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion)
      setFormData({
        title: promotion.title,
        description: promotion.description,
        discount: promotion.discount,
        validFrom: promotion.validFrom.toISOString().split('T')[0],
        validUntil: promotion.validUntil.toISOString().split('T')[0],
        image: promotion.image || '',
        isActive: promotion.isActive
      })
    } else {
      setEditingPromotion(null)
      setFormData({
        title: '',
        description: '',
        discount: 0,
        validFrom: '',
        validUntil: '',
        image: '',
        isActive: true
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPromotion(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual API call
      const url = editingPromotion 
        ? `/api/admin/promotions/${editingPromotion.id}`
        : '/api/admin/promotions'
      
      const method = editingPromotion ? 'PUT' : 'POST'
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state (in real app, refetch from API)
      if (editingPromotion) {
        setPromotions(prev => prev.map(p => 
          p.id === editingPromotion.id 
            ? { ...p, ...formData, validFrom: new Date(formData.validFrom), validUntil: new Date(formData.validUntil) }
            : p
        ))
      } else {
        const newPromotion: Promotion = {
          id: Date.now().toString(),
          ...formData,
          validFrom: new Date(formData.validFrom),
          validUntil: new Date(formData.validUntil),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setPromotions(prev => [newPromotion, ...prev])
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving promotion:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту акцию?')) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setPromotions(prev => prev.filter(p => p.id !== promotionId))
    } catch (error) {
      console.error('Error deleting promotion:', error)
    }
  }

  const handleToggleActive = async (promotionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      setPromotions(prev => prev.map(p => 
        p.id === promotionId ? { ...p, isActive: !p.isActive } : p
      ))
    } catch (error) {
      console.error('Error toggling promotion status:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const isExpired = (date: Date) => {
    return date < new Date()
  }

  return (
    <AdminLayout
      title="Управление акциями"
      description="Создавайте и редактируйте акции и специальные предложения"
      breadcrumbs={[{ name: 'Акции' }]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <TagIcon className="w-5 h-5" />
              <span>Всего акций: {promotions.length}</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <span>Активных: {promotions.filter(p => p.isActive && !isExpired(p.validUntil)).length}</span>
            </div>
          </div>
          
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Создать акцию
          </Button>
        </div>

        {/* Promotions List */}
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
        ) : promotions.length === 0 ? (
          <Card className="p-12 text-center">
            <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">Акций пока нет</h3>
            <p className="text-gray-400 mb-6">Создайте первую акцию для ресторана</p>
            <Button onClick={() => handleOpenModal()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Создать акцию
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promotion, index) => (
              <motion.div
                key={promotion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative h-40 bg-gray-200">
                    {promotion.image ? (
                      <img
                        src={promotion.image}
                        alt={promotion.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status badges */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        promotion.isActive 
                          ? isExpired(promotion.validUntil)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {!promotion.isActive 
                          ? 'Неактивно'
                          : isExpired(promotion.validUntil)
                            ? 'Истекло'
                            : 'Активно'
                        }
                      </span>
                    </div>
                    
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{promotion.discount}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {promotion.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {promotion.description}
                    </p>
                    
                    {/* Validity */}
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{formatDate(promotion.validFrom)} - {formatDate(promotion.validUntil)}</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleToggleActive(promotion.id)}
                        className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                          promotion.isActive
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {promotion.isActive ? 'Деактивировать' : 'Активировать'}
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(promotion)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Редактировать"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(promotion.id)}
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
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingPromotion ? 'Редактировать акцию' : 'Создать акцию'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Название акции"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Введите название акции"
            />
            
            <Textarea
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              placeholder="Опишите условия акции"
            />
            
            <Input
              label="Размер скидки (%)"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) }))}
              required
              min="1"
              max="100"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Действует с"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                required
              />
              
              <Input
                label="Действует до"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                required
              />
            </div>
            
            <Input
              label="Ссылка на изображение"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-900">
                Акция активна
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
                {isSubmitting ? 'Сохранение...' : editingPromotion ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}