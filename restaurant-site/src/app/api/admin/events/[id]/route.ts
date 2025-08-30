import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long').optional(),
  date: z.string().datetime('Invalid date format').optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional().nullable(),
  image: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional()
})

// GET /api/admin/events/[id] - Get specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    
    const event = await prisma.event.findUnique({
      where: {
        id: params.id
      }
    })

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event
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
    
    console.error('Error fetching event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch event'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found'
        },
        { status: 404 }
      )
    }

    // Validate date is in the future if provided
    if (validatedData.date) {
      const eventDate = new Date(validatedData.date)
      const now = new Date()
      
      if (eventDate <= now) {
        return NextResponse.json(
          {
            success: false,
            error: 'Event date must be in the future'
          },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.date !== undefined) updateData.date = new Date(validatedData.date)
    if (validatedData.time !== undefined) updateData.time = validatedData.time
    if (validatedData.capacity !== undefined) updateData.capacity = validatedData.capacity
    if (validatedData.image !== undefined) updateData.image = validatedData.image
    if (validatedData.isPublished !== undefined) updateData.isPublished = validatedData.isPublished

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event data',
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
    
    console.error('Error updating event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update event'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found'
        },
        { status: 404 }
      )
    }

    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
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
    
    console.error('Error deleting event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete event'
      },
      { status: 500 }
    )
  }
}