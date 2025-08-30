import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock data for development when database is unavailable
const mockPromotions = [
  {
    id: '1',
    title: 'Скидка 20% на все пиццы',
    description: 'Действует на все виды пиццы до конца месяца. Не упустите возможность попробовать наши фирменные пиццы по выгодной цене!',
    discount: 20,
    validFrom: new Date('2024-08-01'),
    validUntil: new Date('2025-12-31'),
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Бесплатный десерт',
    description: 'При заказе основного блюда на сумму от 1500 рублей - десерт в подарок! Выберите из нашей коллекции изысканных десертов.',
    discount: 0,
    validFrom: new Date('2024-08-15'),
    validUntil: new Date('2025-12-15'),
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&h=300&fit=crop',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    title: 'Счастливые часы',
    description: 'С 15:00 до 18:00 скидка 15% на все напитки. Идеальное время для деловых встреч или просто отдыха с друзьями.',
    discount: 15,
    validFrom: new Date('2024-08-01'),
    validUntil: new Date('2025-11-30'),
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=300&fit=crop',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
]

export async function GET() {
  try {
    let promotions
    
    try {
      // Try to fetch from database first
      promotions = await prisma.promotion.findMany({
        where: {
          isActive: true,
          validUntil: {
            gte: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (dbError) {
      // If database is unavailable, use mock data
      console.log('Database unavailable, using mock data for promotions')
      promotions = mockPromotions.filter(p => 
        p.isActive && p.validUntil >= new Date()
      )
    }

    const response = NextResponse.json({
      success: true,
      data: promotions
    })

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300')

    return response
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch promotions'
      },
      { status: 500 }
    )
  }
}