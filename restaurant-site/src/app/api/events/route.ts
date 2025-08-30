import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        date: {
          gte: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    const response = NextResponse.json({
      success: true,
      data: events
    })

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600')

    return response
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events'
      },
      { status: 500 }
    )
  }
}