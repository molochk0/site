'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface NavigationItem {
  name: string
  href: string
}

const navigation: NavigationItem[] = [
  { name: 'Главная', href: '#home' },
  { name: 'Меню', href: '#menu' },
  { name: 'Акции', href: '#promotions' },
  { name: 'События', href: '#events' },
  { name: 'О нас', href: '#about' },
  { name: 'Контакты', href: '#contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ${
                  isScrolled ? 'text-white' : 'text-white'
                }`}>
                  <span className="font-bold text-sm lg:text-base">В</span>
                </div>
                <span className={`font-bold text-lg lg:text-xl font-serif transition-colors ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  Вкусный уголок
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className={`text-sm font-medium transition-colors hover:text-amber-500 ${
                    isScrolled ? 'text-gray-700' : 'text-white/90'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                </motion.button>
              ))}
            </nav>

            {/* Contact Info & CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${
                isScrolled ? 'text-gray-600' : 'text-white/80'
              }`}>
                <PhoneIcon className="w-4 h-4" />
                <span>+7 (495) 123-45-67</span>
              </div>
              <Button 
                variant={isScrolled ? "primary" : "secondary"}
                size="sm"
                onClick={() => scrollToSection('#contact')}
              >
                Бронирование
              </Button>
            </div>

            {/* Mobile menu button */}
            <motion.button
              className={`lg:hidden p-2 rounded-md transition-colors ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              className="fixed top-16 right-0 bottom-0 w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6">
                {/* Navigation Links */}
                <nav className="space-y-4">
                  {navigation.map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className="block w-full text-left px-4 py-3 text-gray-700 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.name}
                    </motion.button>
                  ))}
                </nav>

                {/* Contact Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Контакты</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 text-amber-500" />
                      <span>+7 (495) 123-45-67</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 text-amber-500" />
                      <span>ул. Арбат, 25, Москва</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6"
                    onClick={() => scrollToSection('#contact')}
                  >
                    Забронировать столик
                  </Button>
                </div>

                {/* Working Hours */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Часы работы</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Пн-Чт:</span>
                      <span>12:00 - 23:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Пт-Сб:</span>
                      <span>12:00 - 01:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Вс:</span>
                      <span>12:00 - 23:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}