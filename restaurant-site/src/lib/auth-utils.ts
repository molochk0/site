import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { prisma } from './prisma'
import type { User } from '@/types'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return null
    }

    return user as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  
  return user
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

export function isAuthenticated(user: User | null): boolean {
  return !!user
}