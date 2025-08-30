import { AdminLayout } from '@/components/admin/admin-layout'
import { PerformanceDashboard } from '@/components/admin/performance-dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Производительность',
  description: 'Мониторинг производительности веб-сайта ресторана'
}

export default function PerformancePage() {
  return (
    <AdminLayout
      title="Производительность сайта"
      description="Мониторинг Core Web Vitals и производительности"
      breadcrumbs={[
        { name: 'Панель управления', href: '/admin' },
        { name: 'Производительность' }
      ]}
    >
      <PerformanceDashboard />
    </AdminLayout>
  )
}