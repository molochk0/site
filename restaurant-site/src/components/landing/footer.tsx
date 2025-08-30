'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon,
  HeartIcon 
} from '@heroicons/react/24/outline'

interface FooterProps {
  contact?: {
    address: string
    phone: string
    email: string
    hours: Record<string, string>
    socialMedia?: {
      instagram?: string
      facebook?: string
      telegram?: string
    }
  }
}

const defaultContact = {
  address: 'ул. Арбат, 25, Москва, 119002',
  phone: '+7 (495) 123-45-67',
  email: 'info@vkusnyy-ugolok.ru',
  hours: {
    'Пн-Чт': '12:00 - 23:00',
    'Пт-Сб': '12:00 - 01:00',
    'Вс': '12:00 - 23:00'
  },
  socialMedia: {
    instagram: 'https://instagram.com/vkusnyy_ugolok',
    facebook: 'https://facebook.com/vkusnyyugolok',
    telegram: 'https://t.me/vkusnyy_ugolok'
  }
}

const navigation = {
  main: [
    { name: 'Главная', href: '#home' },
    { name: 'Меню', href: '#menu' },
    { name: 'Акции', href: '#promotions' },
    { name: 'События', href: '#events' },
    { name: 'О нас', href: '#about' },
    { name: 'Контакты', href: '#contact' },
  ],
  services: [
    { name: 'Бронирование столиков', href: '#contact' },
    { name: 'Банкеты и мероприятия', href: '#contact' },
    { name: 'Доставка', href: '#contact' },
    { name: 'Кейтеринг', href: '#contact' },
  ],
  legal: [
    { name: 'Политика конфиденциальности', href: '/privacy' },
    { name: 'Условия использования', href: '/terms' },
    { name: 'Публичная оферта', href: '/offer' },
  ]
}

const socialMediaIcons = {
  instagram: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12.017 0C8.396 0 7.999.01 6.756.048 5.517.087 4.707.222 3.995.42a7.88 7.88 0 0 0-2.847 1.85A7.88 7.88 0 0 0 .296 5.117C.098 5.828-.037 6.638.002 7.877.04 9.12.05 9.517.05 13.138s.01 4.017.048 5.26c.039 1.24.174 2.049.372 2.761a7.88 7.88 0 0 0 1.85 2.847 7.88 7.88 0 0 0 2.847 1.85c.711.198 1.521.333 2.761.372 1.243.038 1.64.048 5.261.048s4.017-.01 5.26-.048c1.24-.039 2.049-.174 2.761-.372a7.88 7.88 0 0 0 2.847-1.85 7.88 7.88 0 0 0 1.85-2.847c.198-.711.333-1.521.372-2.761.038-1.243.048-1.64.048-5.261s-.01-4.017-.048-5.26c-.039-1.24-.174-2.049-.372-2.761a7.88 7.88 0 0 0-1.85-2.847A7.88 7.88 0 0 0 19.138.67c-.711-.198-1.521-.333-2.761-.372C15.134.01 14.737 0 11.117 0h.9zm-.081 1.802h.164c3.499 0 3.915.009 5.297.048 1.276.058 1.967.27 2.428.447.61.237 1.045.52 1.501.976.456.456.74.892.976 1.501.177.461.389 1.152.447 2.428.039 1.382.048 1.798.048 5.297s-.009 3.915-.048 5.297c-.058 1.276-.27 1.967-.447 2.428-.237.61-.52 1.045-.976 1.501-.456.456-.892.74-1.501.976-.461.177-1.152.389-2.428.447-1.382.039-1.798.048-5.297.048s-3.915-.009-5.297-.048c-1.276-.058-1.967-.27-2.428-.447-.61-.237-1.045-.52-1.501-.976-.456-.456-.74-.892-.976-1.501-.177-.461-.389-1.152-.447-2.428-.039-1.382-.048-1.798-.048-5.297s.009-3.915.048-5.297c.058-1.276.27-1.967.447-2.428.237-.61.52-1.045.976-1.501.456-.456.892-.74 1.501-.976.461-.177 1.152-.389 2.428-.447 1.382-.039 1.798-.048 5.297-.048z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z" clipRule="evenodd" />
    </svg>
  ),
  facebook: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  ),
  telegram: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

export function Footer({ contact = defaultContact }: FooterProps) {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="font-bold text-white">В</span>
                </div>
                <span className="font-bold text-xl font-serif">Вкусный уголок</span>
              </Link>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Ресторан изысканной кухни, где каждое блюдо - это произведение искусства, 
                а каждый визит - незабываемое гастрономическое путешествие.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                {contact.socialMedia?.instagram && (
                  <a
                    href={contact.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                  >
                    {socialMediaIcons.instagram}
                  </a>
                )}
                {contact.socialMedia?.facebook && (
                  <a
                    href={contact.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                  >
                    {socialMediaIcons.facebook}
                  </a>
                )}
                {contact.socialMedia?.telegram && (
                  <a
                    href={contact.socialMedia.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                  >
                    {socialMediaIcons.telegram}
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6">Навигация</h3>
              <ul className="space-y-3">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Services */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6">Услуги</h3>
              <ul className="space-y-3">
                {navigation.services.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-6">Контакты</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{contact.address}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <a 
                    href={`tel:${contact.phone}`}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {contact.phone}
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
              
              {/* Working Hours */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <ClockIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-medium">Часы работы</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(contact.hours).map(([days, hours]) => (
                    <div key={days} className="flex justify-between text-sm">
                      <span className="text-gray-400">{days}:</span>
                      <span className="text-gray-300">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mt-12"
        >
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-4">Подпишитесь на новости</h3>
            <p className="text-gray-400 text-sm mb-6">
              Узнавайте первыми о новых блюдах, акциях и мероприятиях
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                Подписаться
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© 2024 Вкусный уголок. Все права защищены.</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
            </div>
            
            {/* Legal Links */}
            <div className="flex space-x-6">
              {navigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}