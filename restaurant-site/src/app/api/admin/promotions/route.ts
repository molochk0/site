import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'

const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
  discount: z.number().min(0, 'Discount must be positive').max(100, 'Discount cannot exceed 100%'),
  validFrom: z.string().datetime('Invalid date format'),
  validUntil: z.string().datetime('Invalid date format'),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true)
})

// GET /api/admin/promotions - Get all promotions for admin
export async function GET() {
  try {
    await requireAdmin()
    
    const promotions = await prisma.promotion.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: promotions
    })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch promotions'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/promotions - Create new promotion
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const validatedData = promotionSchema.parse(body)

    // Validate date range
    const validFrom = new Date(validatedData.validFrom)
    const validUntil = new Date(validatedData.validUntil)
    
    if (validFrom >= validUntil) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid from date must be before valid until date'
        },
        { status: 400 }
      )
    }

    const promotion = await prisma.promotion.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        discount: validatedData.discount,
        validFrom,
        validUntil,
        image: validatedData.image,
        isActive: validatedData.isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: promotion,
      message: 'Promotion created successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid promotion data',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }
    
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create promotion'
      },
      { status: 500 }
    )
  }
}