import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
  date: z.string().datetime('Invalid date format'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  image: z.string().url().optional(),
  isPublished: z.boolean().default(false)
})

// GET /api/admin/events - Get all events for admin
export async function GET() {
  try {
    await requireAdmin()
    
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    
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
        error: 'Failed to fetch events'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const validatedData = eventSchema.parse(body)

    // Validate date is in the future
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

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        date: eventDate,
        time: validatedData.time,
        capacity: validatedData.capacity,
        image: validatedData.image,
        isPublished: validatedData.isPublished
      }
    })

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event created successfully'
    }, { status: 201 })
    
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
    
    console.error('Error creating event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event'
      },
      { status: 500 }
    )
  }
}