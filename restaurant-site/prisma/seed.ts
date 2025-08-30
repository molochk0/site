import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clean existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Cleaning existing data...')
      await prisma.promotion.deleteMany()
      await prisma.event.deleteMany()
      await prisma.content.deleteMany()
      await prisma.user.deleteMany()
    }

    // Create admin user
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@restaurant.com' },
      update: {},
      create: {
        name: 'Restaurant Administrator',
        email: 'admin@restaurant.com',
        role: 'admin',
        emailVerified: new Date(),
      }
    })

    console.log(`✅ Created admin user: ${adminUser.email}`)

    // Seed promotions
    console.log('🎯 Seeding promotions...')
    const promotions = [
      {
        title: 'Скидка на бизнес-ланч',
        description: 'С понедельника по пятницу с 12:00 до 16:00 скидка 20% на все бизнес-ланч меню. Отличная возможность насладиться изысканными блюдами по выгодной цене.',
        discount: 20,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-06-30'),
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&h=300&fit=crop',
        isActive: true
      },
      {
        title: 'Вечер романтики',
        description: 'Каждую пятницу и субботу - романтический ужин для двоих со скидкой 25%. Включает: салат, основное блюдо, десерт и бокал вина.',
        discount: 25,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-06-30'),
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&h=300&fit=crop',
        isActive: true
      },
      {
        title: 'Семейный ужин',
        description: 'При заказе от 3000₽ - скидка 15% для семей с детьми. Детское меню входит в стоимость. Действует ежедневно с 17:00 до 20:00.',
        discount: 15,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
        isActive: true
      },
      {
        title: 'День рождения',
        description: 'Именинникам - комплимент от шефа и скидка 20% на весь заказ. При предъявлении документа в день рождения или за 3 дня до/после.',
        discount: 20,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
        isActive: true
      },
      {
        title: 'Счастливые часы',
        description: 'Каждый день с 15:00 до 18:00 все напитки со скидкой 30%. Идеальное время для встреч с друзьями и коллегами.',
        discount: 30,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=500&h=300&fit=crop',
        isActive: true
      },
      {
        title: 'Воскресный бранч',
        description: 'По воскресеньям с 11:00 до 15:00 специальное бранч-меню со скидкой 18%. Включает свежую выпечку, яйца бенедикт и свежевыжатые соки.',
        discount: 18,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=300&fit=crop',
        isActive: true
      }
    ]

    for (const promotion of promotions) {
      const created = await prisma.promotion.create({
        data: promotion
      })
      console.log(`  ✅ Created promotion: ${created.title}`)
    }

    // Seed events
    console.log('🎪 Seeding events...')
    const events = [
      {
        title: 'Мастер-класс от шеф-повара',
        description: 'Уникальная возможность научиться готовить фирменные блюда нашего ресторана под руководством опытного шеф-повара. В программе: приготовление 3 блюд, дегустация вин, сертификат участника.',
        date: new Date('2024-02-15'),
        time: '18:00',
        capacity: 12,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop',
        isPublished: true
      },
      {
        title: 'Винный ужин с сомелье',
        description: 'Эксклюзивный винный ужин с профессиональным сомелье. Дегустация 5 сортов вин в сочетании с авторскими закусками. Узнайте секреты правильного сочетания вин и блюд.',
        date: new Date('2024-02-22'),
        time: '19:30',
        capacity: 20,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=300&fit=crop',
        isPublished: true
      },
      {
        title: 'Ночь джаза',
        description: 'Атмосферный вечер под живую джазовую музыку. Выступление известного джазового трио, специальное меню и коктейли. Погрузитесь в мир изысканной музыки и кулинарии.',
        date: new Date('2024-03-01'),
        time: '20:00',
        capacity: 50,
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
        isPublished: true
      },
      {
        title: 'Дегустационное меню весенней коллекции',
        description: 'Первая дегустация новой весенней коллекции блюд от нашего шеф-повара. 7 блюд, каждое из которых отражает пробуждение природы и свежесть весенних ингредиентов.',
        date: new Date('2024-03-20'),
        time: '19:00',
        capacity: 25,
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
        isPublished: true
      },
      {
        title: 'День открытых дверей',
        description: 'Приглашаем на экскурсию по кухне ресторана! Познакомьтесь с командой поваров, узнайте о процессе приготовления блюд, попробуйте фирменные закуски.',
        date: new Date('2024-04-10'),
        time: '16:00',
        capacity: 30,
        image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&h=300&fit=crop',
        isPublished: true
      },
      {
        title: 'Кулинарный поединок',
        description: 'Захватывающее шоу, где два наших шеф-повара соревнуются в приготовлении блюд на скорость. Гости становятся судьями и дегустируют результаты поединка.',
        date: new Date('2024-04-25'),
        time: '18:30',
        capacity: 40,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop',
        isPublished: true
      }
    ]

    for (const event of events) {
      const created = await prisma.event.create({
        data: event
      })
      console.log(`  ✅ Created event: ${created.title}`)
    }

    // Seed content
    console.log('📄 Seeding content...')
    const contentData = [
      {
        key: 'hero',
        value: {
          title: 'Добро пожаловать в наш ресторан',
          subtitle: 'Изысканная кухня в атмосферном пространстве',
          description: 'Откройте для себя мир высокой кулинарии, где каждое блюдо — это произведение искусства, а каждый ужин — незабываемое событие.',
          backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop',
          ctaText: 'Забронировать столик',
          ctaLink: '#reservation'
        }
      },
      {
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
          ],
          stats: {
            experience: '15+ лет опыта',
            dishes: '200+ блюд в меню',
            awards: '5 кулинарных наград',
            guests: '10000+ довольных гостей'
          }
        }
      },
      {
        key: 'contact',
        value: {
          title: 'Контакты',
          description: 'Свяжитесь с нами для бронирования или получения дополнительной информации',
          address: {
            street: 'ул. Примерная, 123',
            city: 'Москва',
            postalCode: '101000',
            country: 'Россия'
          },
          phone: '+7 (495) 123-45-67',
          email: 'info@restaurant.ru',
          workingHours: {
            weekdays: 'Пн-Чт: 12:00 - 00:00',
            weekends: 'Пт-Сб: 12:00 - 02:00',
            sunday: 'Вс: 12:00 - 23:00'
          },
          socialMedia: {
            instagram: 'https://instagram.com/restaurant',
            facebook: 'https://facebook.com/restaurant',
            telegram: 'https://t.me/restaurant'
          },
          location: {
            latitude: 55.7558,
            longitude: 37.6176
          }
        }
      },
      {
        key: 'menu_preview',
        value: {
          title: 'Наше меню',
          subtitle: 'Попробуйте наши фирменные блюда',
          categories: [
            {
              id: 'appetizers',
              name: 'Закуски',
              image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
              description: 'Изысканные закуски для начала трапезы',
              dishes: [
                { name: 'Карпаччо из говядины', price: 1200, description: 'Тонко нарезанная говяжья вырезка с пармезаном и руколой' },
                { name: 'Тартар из лосося', price: 950, description: 'Свежий лосось с авокадо и лимонным дрессингом' },
                { name: 'Устрицы Фин де Клер', price: 450, description: 'Свежие устрицы с мигонеттом (за штуку)' }
              ]
            },
            {
              id: 'main_courses',
              name: 'Основные блюда',
              image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
              description: 'Авторские блюда от шеф-повара',
              dishes: [
                { name: 'Стейк Рибай', price: 2800, description: 'Мраморная говядина с картофельным пюре и соусом демиглас' },
                { name: 'Морской окунь в соляной корке', price: 2200, description: 'Рыба, запеченная в ароматной соляной корке с травами' },
                { name: 'Каре ягненка', price: 3200, description: 'Нежное каре с розмарином и чесночным конфи' }
              ]
            },
            {
              id: 'desserts',
              name: 'Десерты',
              image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
              description: 'Сладкое завершение ужина',
              dishes: [
                { name: 'Тирамису', price: 650, description: 'Классический итальянский десерт с кофе и маскарпоне' },
                { name: 'Крем-брюле', price: 580, description: 'Ванильный крем с карамельной корочкой' },
                { name: 'Шоколадный фондан', price: 720, description: 'Теплый шоколадный кекс с жидкой серединкой' }
              ]
            }
          ]
        }
      },
      {
        key: 'restaurant_info',
        value: {
          name: 'Le Gourmet',
          tagline: 'Изысканная кухня для истинных гурманов',
          description: 'Ресторан высокой кухни с авторским меню и безупречным сервисом',
          cuisine: ['Европейская', 'Средиземноморская', 'Авторская'],
          priceRange: '₽₽₽₽',
          capacity: 80,
          yearEstablished: 2009,
          awards: [
            'Золотая вилка 2023',
            'Лучший ресторан города 2022',
            'Выбор критиков 2021',
            'Премия за инновации 2020',
            'Ресторан года 2019'
          ]
        }
      }
    ]

    for (const content of contentData) {
      const created = await prisma.content.upsert({
        where: { key: content.key },
        update: { value: content.value },
        create: content
      })
      console.log(`  ✅ Created/updated content: ${created.key}`)
    }

    console.log('🎉 Database seeding completed successfully!')
    
    // Print summary
    const promotionCount = await prisma.promotion.count()
    const eventCount = await prisma.event.count()
    const contentCount = await prisma.content.count()
    const userCount = await prisma.user.count()

    console.log('\n📊 Seeding Summary:')
    console.log(`  Users: ${userCount}`)
    console.log(`  Promotions: ${promotionCount}`)
    console.log(`  Events: ${eventCount}`)
    console.log(`  Content entries: ${contentCount}`)
    console.log('\n✨ Your restaurant website is ready to go!')
    console.log('\n🔑 Admin Login Credentials:')
    console.log('  Email: admin@restaurant.com')
    console.log('  Password: admin123')
    console.log('\n🌐 Access the admin panel at: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })