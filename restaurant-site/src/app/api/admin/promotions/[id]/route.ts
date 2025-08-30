import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'

const updatePromotionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long').optional(),
  discount: z.number().min(0, 'Discount must be positive').max(100, 'Discount cannot exceed 100%').optional(),
  validFrom: z.string().datetime('Invalid date format').optional(),
  validUntil: z.string().datetime('Invalid date format').optional(),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().optional()
})

// GET /api/admin/promotions/[id] - Get specific promotion
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    
    const promotion = await prisma.promotion.findUnique({
      where: {
        id: params.id
      }
    })

    if (!promotion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promotion not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: promotion
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }
    
    console.error('Error fetching promotion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch promotion'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/promotions/[id] - Update promotion
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const validatedData = updatePromotionSchema.parse(body)

    // Check if promotion exists
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: params.id }
    })

    if (!existingPromotion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promotion not found'
        },
        { status: 404 }
      )
    }

    // Validate date range if dates are provided
    if (validatedData.validFrom || validatedData.validUntil) {
      const validFrom = validatedData.validFrom ? new Date(validatedData.validFrom) : existingPromotion.validFrom
      const validUntil = validatedData.validUntil ? new Date(validatedData.validUntil) : existingPromotion.validUntil
      
      if (validFrom >= validUntil) {
        return NextResponse.json(
          {
            success: false,
            error: 'Valid from date must be before valid until date'
          },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.discount !== undefined) updateData.discount = validatedData.discount
    if (validatedData.validFrom !== undefined) updateData.validFrom = new Date(validatedData.validFrom)
    if (validatedData.validUntil !== undefined) updateData.validUntil = new Date(validatedData.validUntil)
    if (validatedData.image !== undefined) updateData.image = validatedData.image
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive

    const promotion = await prisma.promotion.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: promotion,
      message: 'Promotion updated successfully'
    })
    
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
    
    console.error('Error updating promotion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update promotion'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/promotions/[id] - Delete promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    
    // Check if promotion exists
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: params.id }
    })

    if (!existingPromotion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promotion not found'
        },
        { status: 404 }
      )
    }

    await prisma.promotion.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully'
    })
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }
    
    console.error('Error deleting promotion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete promotion'
      },
      { status: 500 }
    )
  }
}