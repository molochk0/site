'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  TagIcon, 
  CalendarDaysIcon, 
  UserGroupIcon,
  EyeIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Card } from '@/components/ui/card'

interface DashboardStats {
  totalPromotions: number
  activePromotions: number
  totalEvents: number
  upcomingEvents: number
  totalVisits: number
  todayVisits: number
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: React.ElementType
  color: 'blue' | 'green' | 'amber' | 'purple'
}

const StatCard = ({ title, value, change, changeType, icon: Icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    green: 'bg-green-500 text-green-600',
    amber: 'bg-amber-500 text-amber-600',
    purple: 'bg-purple-500 text-purple-600'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">от прошлого месяца</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[0]}/10`}>
          <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPromotions: 0,
    activePromotions: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalVisits: 0,
    todayVisits: 0
  })
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API calls - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          totalPromotions: 8,
          activePromotions: 4,
          totalEvents: 12,
          upcomingEvents: 5,
          totalVisits: 15420,
          todayVisits: 142
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const recentActivity = [
    {
      id: 1,
      type: 'promotion',
      title: 'Создана новая акция "Счастливые часы"',
      time: '2 часа назад',
      icon: TagIcon
    },
    {
      id: 2,
      type: 'event',
      title: 'Забронировано 5 мест на "Вечер живой музыки"',
      time: '4 часа назад',
      icon: CalendarDaysIcon
    },
    {
      id: 3,
      type: 'visit',
      title: 'Новый рекорд посещений за день - 200 человек',
      time: '1 день назад',
      icon: UserGroupIcon
    }
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Панель управления" description="Обзор состояния ресторана">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </Card>
          ))}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title="Панель управления" 
      description="Обзор состояния ресторана и последние обновления"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatCard
              title="Всего акций"
              value={stats.totalPromotions}
              change={12}
              changeType="increase"
              icon={TagIcon}
              color="amber"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatCard
              title="Активные акции"
              value={stats.activePromotions}
              icon={TrendingUpIcon}
              color="green"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatCard
              title="Предстоящие события"
              value={stats.upcomingEvents}
              change={25}
              changeType="increase"
              icon={CalendarDaysIcon}
              color="blue"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatCard
              title="Посещений сегодня"
              value={stats.todayVisits}
              change={8}
              changeType="increase"
              icon={EyeIcon}
              color="purple"
            />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center p-4 text-left bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors group">
                <TagIcon className="w-8 h-8 text-amber-500 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-gray-900">Создать акцию</div>
                  <div className="text-sm text-gray-600">Добавить новое предложение</div>
                </div>
              </button>
              
              <button className="flex items-center p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                <CalendarDaysIcon className="w-8 h-8 text-blue-500 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-gray-900">Создать событие</div>
                  <div className="text-sm text-gray-600">Запланировать мероприятие</div>
                </div>
              </button>
              
              <button className="flex items-center p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
                <ChartBarIcon className="w-8 h-8 text-green-500 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-gray-900">Посмотреть отчеты</div>
                  <div className="text-sm text-gray-600">Аналитика и статистика</div>
                </div>
              </button>
              
              <button className="flex items-center p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                <EyeIcon className="w-8 h-8 text-purple-500 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-gray-900">Посмотреть сайт</div>
                  <div className="text-sm text-gray-600">Открыть в новой вкладке</div>
                </div>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Последняя активность</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <activity.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Состояние системы</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">База данных</div>
                  <div className="text-xs text-gray-600">Подключение активно</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">API сервисы</div>
                  <div className="text-xs text-gray-600">Все сервисы работают</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Резервное копирование</div>
                  <div className="text-xs text-gray-600">Последнее: 2 часа назад</div>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </Card>
        </motion.div>
      </AdminPageWrapper>
    </AdminLayout>
  )
}