import { prisma } from './prisma'
import type { Promotion, Event, PromotionFormData, EventFormData } from '@/types'

// Promotion queries
export async function getActivePromotions() {
  try {
    return await prisma.promotion.findMany({
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
  } catch (error) {
    console.error('Error fetching active promotions:', error)
    return []
  }
}

export async function getAllPromotions() {
  try {
    return await prisma.promotion.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching all promotions:', error)
    return []
  }
}

export async function createPromotion(data: PromotionFormData) {
  return await prisma.promotion.create({
    data: {
      title: data.title,
      description: data.description,
      discount: data.discount,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      image: typeof data.image === 'string' ? data.image : undefined,
      isActive: data.isActive
    }
  })
}

export async function updatePromotion(id: string, data: Partial<PromotionFormData>) {
  const updateData: any = {}
  
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.discount !== undefined) updateData.discount = data.discount
  if (data.validFrom !== undefined) updateData.validFrom = data.validFrom
  if (data.validUntil !== undefined) updateData.validUntil = data.validUntil
  if (data.image !== undefined) updateData.image = typeof data.image === 'string' ? data.image : undefined
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  return await prisma.promotion.update({
    where: { id },
    data: updateData
  })
}

export async function deletePromotion(id: string) {
  return await prisma.promotion.delete({
    where: { id }
  })
}

// Event queries
export async function getPublishedEvents() {
  try {
    return await prisma.event.findMany({
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
  } catch (error) {
    console.error('Error fetching published events:', error)
    return []
  }
}

export async function getAllEvents() {
  try {
    return await prisma.event.findMany({
      orderBy: {
        date: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching all events:', error)
    return []
  }
}

export async function createEvent(data: EventFormData) {
  return await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      capacity: data.capacity,
      image: typeof data.image === 'string' ? data.image : undefined,
      isPublished: data.isPublished
    }
  })
}

export async function updateEvent(id: string, data: Partial<EventFormData>) {
  const updateData: any = {}
  
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.date !== undefined) updateData.date = data.date
  if (data.time !== undefined) updateData.time = data.time
  if (data.capacity !== undefined) updateData.capacity = data.capacity
  if (data.image !== undefined) updateData.image = typeof data.image === 'string' ? data.image : undefined
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished

  return await prisma.event.update({
    where: { id },
    data: updateData
  })
}

export async function deleteEvent(id: string) {
  return await prisma.event.delete({
    where: { id }
  })
}

// Content queries
export async function getContentByKey(key: string) {
  try {
    return await prisma.content.findUnique({
      where: { key }
    })
  } catch (error) {
    console.error(`Error fetching content for key ${key}:`, error)
    return null
  }
}

export async function getAllContent() {
  try {
    return await prisma.content.findMany({
      orderBy: {
        key: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching all content:', error)
    return []
  }
}

export async function upsertContent(key: string, value: any) {
  return await prisma.content.upsert({
    where: { key },
    update: { 
      value,
      updatedAt: new Date()
    },
    create: { 
      key,
      value
    }
  })
}

export async function deleteContent(key: string) {
  return await prisma.content.delete({
    where: { key }
  })
}

// User queries
export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })
  } catch (error) {
    console.error(`Error fetching user by email ${email}:`, error)
    return null
  }
}

export async function createUser(email: string, name?: string) {
  return await prisma.user.create({
    data: {
      email,
      name,
      role: 'admin' // Default role for new users
    }
  })
}

// Dashboard statistics
export async function getDashboardStats() {
  try {
    const [
      totalPromotions,
      activePromotions,
      totalEvents,
      publishedEvents,
      upcomingEvents
    ] = await Promise.all([
      prisma.promotion.count(),
      prisma.promotion.count({
        where: {
          isActive: true,
          validUntil: { gte: new Date() }
        }
      }),
      prisma.event.count(),
      prisma.event.count({
        where: { isPublished: true }
      }),
      prisma.event.count({
        where: {
          isPublished: true,
          date: { gte: new Date() }
        }
      })
    ])

    return {
      totalPromotions,
      activePromotions,
      totalEvents,
      publishedEvents,
      upcomingEvents
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalPromotions: 0,
      activePromotions: 0,
      totalEvents: 0,
      publishedEvents: 0,
      upcomingEvents: 0
    }
  }
}

// Database health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true }
  } catch (error) {
    console.error('Database connection error:', error)
    return { connected: false, error }
  }
}