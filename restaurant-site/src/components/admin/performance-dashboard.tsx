'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ChartBarIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface PerformanceData {
  reports: Array<{
    url: string
    timestamp: number
    score: { score: number; grade: string }
    metrics: {
      lcp: number
      fid: number
      cls: number
      fcp: number
      ttfb: number
    }
    connectionType: string
  }>
  aggregated: {
    period: { from: number; to: number; count: number }
    coreWebVitals: {
      lcp: { avg: number; p95: number }
      fid: { avg: number; p95: number }
      cls: { avg: number; p95: number }
    }
    loadingMetrics: {
      fcp: { avg: number; p95: number }
      ttfb: { avg: number; p95: number }
    }
    overallScore: { avg: number; min: number; max: number }
    gradeDistribution: { A: number; B: number; C: number; D: number; F: number }
    deviceTypes: { mobile: number; desktop: number; tablet: number }
    connectionTypes: Record<string, number>
  }
}

export function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/performance?limit=100')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch performance data')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Performance data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <ArrowPathIcon className="w-6 h-6 animate-spin" />
          <span>Загрузка данных о производительности...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ошибка загрузки данных</h3>
          <p className="text-gray-600 mb-4">{error || 'Не удалось загрузить данные о производительности'}</p>
          <Button onClick={fetchData} variant="outline">
            Попробовать снова
          </Button>
        </Card>
      </div>
    )
  }

  const { aggregated } = data

  if (!aggregated) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет данных</h3>
          <p className="text-gray-600">Данные о производительности еще не собраны</p>
        </Card>
      </div>
    )
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMetricStatus = (value: number, goodThreshold: number, poorThreshold: number) => {
    if (value <= goodThreshold) return { status: 'good', color: 'text-green-600' }
    if (value <= poorThreshold) return { status: 'needs-improvement', color: 'text-yellow-600' }
    return { status: 'poor', color: 'text-red-600' }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Производительность сайта</h2>
          <p className="text-gray-600">
            Данные за период: {formatTime(aggregated.period.from)} - {formatTime(aggregated.period.to)}
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Обновить
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Общая оценка</h3>
          <div className={`text-3xl font-bold ${getScoreColor(aggregated.overallScore.avg)}`}>
            {Math.round(aggregated.overallScore.avg)}/100
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-4 text-center">
          {Object.entries(aggregated.gradeDistribution).map(([grade, count]) => (
            <div key={grade} className="space-y-2">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-gray-600">Оценка {grade}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">LCP (Largest Contentful Paint)</h3>
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Среднее:</span>
              <span className={getMetricStatus(aggregated.coreWebVitals.lcp.avg, 2500, 4000).color}>
                {Math.round(aggregated.coreWebVitals.lcp.avg)}мс
              </span>
            </div>
            <div className="flex justify-between">
              <span>95-й процентиль:</span>
              <span className={getMetricStatus(aggregated.coreWebVitals.lcp.p95, 2500, 4000).color}>
                {Math.round(aggregated.coreWebVitals.lcp.p95)}мс
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">FID (First Input Delay)</h3>
            <SignalIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Среднее:</span>
              <span className={getMetricStatus(aggregated.coreWebVitals.fid.avg, 100, 300).color}>
                {Math.round(aggregated.coreWebVitals.fid.avg)}мс
              </span>
            </div>
            <div className="flex justify-between">
              <span>95-й процентиль:</span>
              <span className={getMetricStatus(aggregated.coreWebVitals.fid.p95, 100, 300).color}>
                {Math.round(aggregated.coreWebVitals.fid.p95)}мс
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">CLS (Cumulative Layout Shift)</h3>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Среднее:</span>
              <span className={getMetricStatus(aggregated.coreWebVitals.cls.avg, 0.1, 0.25).color}>
                {aggregated.coreWebVitals.cls.avg.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>95-й процентиль:</span>
              <span className={getMetricStatus(aggregated.coreWebVitals.cls.p95, 0.1, 0.25).color}>
                {aggregated.coreWebVitals.cls.p95.toFixed(3)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Метрики загрузки</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>FCP (First Contentful Paint):</span>
              <span className={getMetricStatus(aggregated.loadingMetrics.fcp.avg, 1800, 3000).color}>
                {Math.round(aggregated.loadingMetrics.fcp.avg)}мс
              </span>
            </div>
            <div className="flex justify-between">
              <span>TTFB (Time to First Byte):</span>
              <span className={getMetricStatus(aggregated.loadingMetrics.ttfb.avg, 800, 1800).color}>
                {Math.round(aggregated.loadingMetrics.ttfb.avg)}мс
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Устройства</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
                <span>Мобильные:</span>
              </div>
              <span className="font-medium">{aggregated.deviceTypes.mobile}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ComputerDesktopIcon className="w-4 h-4 mr-2" />
                <span>Десктоп:</span>
              </div>
              <span className="font-medium">{aggregated.deviceTypes.desktop}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                <span>Планшеты:</span>
              </div>
              <span className="font-medium">{aggregated.deviceTypes.tablet}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Рекомендации по улучшению</h3>
        <div className="space-y-3">
          {aggregated.coreWebVitals.lcp.avg > 2500 && (
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Улучшить LCP</p>
                <p className="text-sm text-gray-600">
                  Оптимизируйте изображения, используйте CDN, улучшите серверную производительность
                </p>
              </div>
            </div>
          )}
          
          {aggregated.coreWebVitals.fid.avg > 100 && (
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Улучшить FID</p>
                <p className="text-sm text-gray-600">
                  Уменьшите JavaScript, разделите код на части, используйте Web Workers
                </p>
              </div>
            </div>
          )}
          
          {aggregated.coreWebVitals.cls.avg > 0.1 && (
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Улучшить CLS</p>
                <p className="text-sm text-gray-600">
                  Задайте размеры для изображений и медиа, избегайте вставки контента над существующим
                </p>
              </div>
            </div>
          )}
          
          {aggregated.coreWebVitals.lcp.avg <= 2500 && 
           aggregated.coreWebVitals.fid.avg <= 100 && 
           aggregated.coreWebVitals.cls.avg <= 0.1 && (
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Отличная производительность!</p>
                <p className="text-sm text-gray-600">
                  Все Core Web Vitals находятся в хорошем диапазоне
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}