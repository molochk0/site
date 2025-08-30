/**
 * Alternative seeding script for local development
 * This script creates JSON files that can be used when database is not available
 */

import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

interface Promotion {
  id: string
  title: string
  description: string
  discount: number
  validFrom: string
  validUntil: string
  image: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  capacity: number | null
  image: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface Content {
  id: string
  key: string
  value: any
  updatedAt: string
}

interface User {
  id: string
  name: string | null
  email: string
  emailVerified: string | null
  image: string | null
  role: string
  createdAt: string
  updatedAt: string
}

async function generateMockData() {
  console.log('🌱 Generating mock data for local development...')

  const now = new Date().toISOString()
  
  // Generate promotions
  const promotions: Promotion[] = [
    {
      id: 'promo-1',
      title: 'Скидка на бизнес-ланч',
      description: 'С понедельника по пятницу с 12:00 до 16:00 скидка 20% на все бизнес-ланч меню. Отличная возможность насладиться изысканными блюдами по выгодной цене.',
      discount: 20,
      validFrom: '2024-01-01T00:00:00.000Z',
      validUntil: '2024-06-30T23:59:59.000Z',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&h=300&fit=crop',
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'promo-2',
      title: 'Вечер романтики',
      description: 'Каждую пятницу и субботу - романтический ужин для двоих со скидкой 25%. Включает: салат, основное блюдо, десерт и бокал вина.',
      discount: 25,
      validFrom: '2024-01-01T00:00:00.000Z',
      validUntil: '2024-06-30T23:59:59.000Z',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&h=300&fit=crop',
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'promo-3',
      title: 'Семейный ужин',
      description: 'При заказе от 3000₽ - скидка 15% для семей с детьми. Детское меню входит в стоимость. Действует ежедневно с 17:00 до 20:00.',
      discount: 15,
      validFrom: '2024-01-01T00:00:00.000Z',
      validUntil: '2024-12-31T23:59:59.000Z',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'promo-4',
      title: 'День рождения',
      description: 'Именинникам - комплимент от шефа и скидка 20% на весь заказ. При предъявлении документа в день рождения или за 3 дня до/после.',
      discount: 20,
      validFrom: '2024-01-01T00:00:00.000Z',
      validUntil: '2024-12-31T23:59:59.000Z',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ]

  // Generate events
  const events: Event[] = [
    {
      id: 'event-1',
      title: 'Мастер-класс от шеф-повара',
      description: 'Уникальная возможность научиться готовить фирменные блюда нашего ресторана под руководством опытного шеф-повара. В программе: приготовление 3 блюд, дегустация вин, сертификат участника.',
      date: '2024-02-15T00:00:00.000Z',
      time: '18:00',
      capacity: 12,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop',
      isPublished: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'event-2',
      title: 'Винный ужин с сомелье',
      description: 'Эксклюзивный винный ужин с профессиональным сомелье. Дегустация 5 сортов вин в сочетании с авторскими закусками. Узнайте секреты правильного сочетания вин и блюд.',
      date: '2024-02-22T00:00:00.000Z',
      time: '19:30',
      capacity: 20,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=300&fit=crop',
      isPublished: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'event-3',
      title: 'Ночь джаза',
      description: 'Атмосферный вечер под живую джазовую музыку. Выступление известного джазового трио, специальное меню и коктейли. Погрузитесь в мир изысканной музыки и кулинарии.',
      date: '2024-03-01T00:00:00.000Z',
      time: '20:00',
      capacity: 50,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
      isPublished: true,
      createdAt: now,
      updatedAt: now
    }
  ]

  // Generate content
  const content: Content[] = [
    {
      id: 'content-1',
      key: 'hero',
      value: {
        title: 'Добро пожаловать в наш ресторан',
        subtitle: 'Изысканная кухня в атмосферном пространстве',
        description: 'Откройте для себя мир высокой кулинарии, где каждое блюдо — это произведение искусства, а каждый ужин — незабываемое событие.',
        backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop',
        ctaText: 'Забронировать столик',
        ctaLink: '#reservation'
      },
      updatedAt: now
    },
    {
      id: 'content-2',
      key: 'about',
      value: {
        title: 'О ресторане',
        description: 'Наш ресторан — это место, где традиции встречаются с инновациями. Мы создаем уникальные кулинарные произведения, используя только лучшие местные ингредиенты и авторские рецепты наших шеф-поваров.',
        features: [
          {
            title: 'Авторская кухня',
            description: 'Уникальные блюда от наших талантливых шеф-поваров',
            icon: 'chef-hat'
          },
          {
            title: 'Свежие ингредиенты',
            description: 'Только лучшие местные и сезонные продукты',
            icon: 'leaf'
          },
          {
            title: 'Атмосферный интерьер',
            description: 'Уютная и элегантная обстановка для особых моментов',
            icon: 'home'
          }
        ]
      },
      updatedAt: now
    }
  ]

  // Generate users
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const users: User[] = [
    {
      id: 'user-1',
      name: 'Restaurant Administrator',
      email: 'admin@restaurant.com',
      emailVerified: now,
      image: null,
      role: 'admin',
      createdAt: now,
      updatedAt: now
    }
  ]

  // Create data directory
  const dataDir = path.join(__dirname, '..', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Write data files
  fs.writeFileSync(
    path.join(dataDir, 'promotions.json'),
    JSON.stringify(promotions, null, 2)
  )
  console.log('✅ Created promotions.json')

  fs.writeFileSync(
    path.join(dataDir, 'events.json'),
    JSON.stringify(events, null, 2)
  )
  console.log('✅ Created events.json')

  fs.writeFileSync(
    path.join(dataDir, 'content.json'),
    JSON.stringify(content, null, 2)
  )
  console.log('✅ Created content.json')

  fs.writeFileSync(
    path.join(dataDir, 'users.json'),
    JSON.stringify(users, null, 2)
  )
  console.log('✅ Created users.json')

  // Create a combined data file
  const allData = {
    promotions,
    events,
    content,
    users,
    metadata: {
      generatedAt: now,
      version: '1.0.0',
      description: 'Mock data for restaurant website development'
    }
  }

  fs.writeFileSync(
    path.join(dataDir, 'seed-data.json'),
    JSON.stringify(allData, null, 2)
  )
  console.log('✅ Created seed-data.json')

  console.log('\n🎉 Mock data generation completed!')
  console.log(`📁 Data files saved to: ${dataDir}`)
  console.log('\n📊 Generated data:')
  console.log(`  Promotions: ${promotions.length}`)
  console.log(`  Events: ${events.length}`)
  console.log(`  Content entries: ${content.length}`)
  console.log(`  Users: ${users.length}`)
  console.log('\n💡 You can use these JSON files as fallback data when the database is not available.')
}

generateMockData().catch(console.error)