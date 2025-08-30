'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut, useSession } from 'next-auth/react'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  TagIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChartBarIcon,
  BellIcon,
  SignalIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { PageTransition, usePageTransition } from '@/hooks/use-page-transitions'

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
}

const navigation: NavigationItem[] = [
  { name: 'Панель управления', href: '/admin', icon: ChartBarIcon },
  { name: 'Акции', href: '/admin/promotions', icon: TagIcon },
  { name: 'События', href: '/admin/events', icon: CalendarDaysIcon },
  { name: 'Контент', href: '/admin/content', icon: DocumentTextIcon },
  { name: 'Производительность', href: '/admin/performance', icon: SignalIcon },
  { name: 'Настройки', href: '/admin/settings', icon: Cog6ToothIcon },
]

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  breadcrumbs?: Array<{ name: string; href?: string }>
}

export function AdminLayout({ 
  children, 
  title = "Панель управления",
  description,
  breadcrumbs = []
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isTransitioning, navigateWithTransition } = usePageTransition()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  const handleNavigation = (href: string) => {
    setSidebarOpen(false)
    if (href !== pathname) {
      navigateWithTransition(href)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-gray-600/75" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%'
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="font-bold text-white text-sm">В</span>
              </div>
              <span className="font-bold text-gray-900">Админ панель</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation with Enhanced Hover Effects */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  whileHover={{ 
                    scale: 1.02,
                    x: isActive ? 0 : 4,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.05 }
                  }}
                >
                  <motion.div
                    animate={isActive ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon 
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} 
                    />
                  </motion.div>
                  {item.name}
                  {item.badge && (
                    <motion.span 
                      className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-600"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Администратор'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || 'admin@restaurant.ru'}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-gray-600 hover:text-gray-900"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          {/* Breadcrumbs */}
          <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                    <HomeIcon className="h-4 w-4" />
                  </Link>
                </li>
                {breadcrumbs.map((breadcrumb, index) => (
                  <li key={breadcrumb.name} className="flex items-center">
                    <svg className="h-4 w-4 text-gray-300 mx-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                    {breadcrumb.href ? (
                      <Link
                        href={breadcrumb.href}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        {breadcrumb.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {breadcrumb.name}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>

              {/* View site link */}
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Посмотреть сайт
              </Link>
            </div>
          </div>
        </header>

        {/* Page header */}
        {(title || description) && (
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 text-sm text-gray-700">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content with Page Transitions */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <PageTransition 
                key={pathname}
                variant="scaleSlide"
                className={`${isTransitioning ? 'pointer-events-none' : ''}`}
              >
                {children}
              </PageTransition>
            </AnimatePresence>
            
            {/* Loading overlay */}
            <AnimatePresence>
              {isTransitioning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
                >
                  <motion.div
                    className="flex flex-col items-center space-y-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">Загрузка...</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}