import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'

const contentUpdateSchema = z.object({
  key: z.string().min(1, 'Content key is required'),
  value: z.any(), // Can be string, object, array, etc.
})

const bulkContentUpdateSchema = z.array(contentUpdateSchema)

// GET /api/admin/content - Get all content for admin management
export async function GET() {
  try {
    await requireAdmin()
    
    const contentRecords = await prisma.content.findMany({
      orderBy: {
        key: 'asc'
      }
    })

    // Transform into a more manageable structure
    const content: Record<string, any> = {}
    
    contentRecords.forEach((record) => {
      const keys = record.key.split('.')
      let current = content
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = record.value
    })

    return NextResponse.json({
      success: true,
      data: {
        structured: content,
        raw: contentRecords
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    
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
        error: 'Failed to fetch content'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/content - Update content (supports both single and bulk updates)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    
    // Check if it's a bulk update or single update
    const isBulk = Array.isArray(body)
    
    if (isBulk) {
      // Bulk update
      const validatedData = bulkContentUpdateSchema.parse(body)
      
      const updates = await Promise.all(
        validatedData.map(async (item) => {
          return prisma.content.upsert({
            where: { key: item.key },
            update: { 
              value: item.value,
              updatedAt: new Date()
            },
            create: { 
              key: item.key,
              value: item.value
            }
          })
        })
      )
      
      return NextResponse.json({
        success: true,
        data: updates,
        message: `Updated ${updates.length} content items successfully`
      })
    } else {
      // Single update
      const validatedData = contentUpdateSchema.parse(body)
      
      const content = await prisma.content.upsert({
        where: { key: validatedData.key },
        update: { 
          value: validatedData.value,
          updatedAt: new Date()
        },
        create: { 
          key: validatedData.key,
          value: validatedData.value
        }
      })
      
      return NextResponse.json({
        success: true,
        data: content,
        message: 'Content updated successfully'
      })
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid content data',
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
    
    console.error('Error updating content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update content'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/content - Delete content by key
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content key is required'
        },
        { status: 400 }
      )
    }
    
    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { key }
    })
    
    if (!existingContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content not found'
        },
        { status: 404 }
      )
    }
    
    await prisma.content.delete({
      where: { key }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
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
    
    console.error('Error deleting content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete content'
      },
      { status: 500 }
    )
  }
}