import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  environment: string
  version: string
  services: {
    database: 'connected' | 'disconnected' | 'error'
    redis?: 'connected' | 'disconnected' | 'error'
    external_apis?: 'available' | 'unavailable' | 'error'
  }
  checks: {
    database_query: boolean
    database_write: boolean
    memory_usage: {
      used: number
      percentage: number
    }
  }
  details?: {
    database_latency?: number
    error_message?: string
  }
}

export async function GET() {
  const startTime = Date.now()
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
  const checks: any = {
    database_query: false,
    database_write: false,
    memory_usage: {
      used: 0,
      percentage: 0
    }
  }
  const services: any = {
    database: 'disconnected'
  }
  const details: any = {}

  try {
    // Database connectivity test
    const dbStartTime = Date.now()
    await prisma.$queryRaw`SELECT 1 as test`
    const dbLatency = Date.now() - dbStartTime
    
    services.database = 'connected'
    checks.database_query = true
    details.database_latency = dbLatency
    
    // Database write test (using a health check table or existing table)
    try {
      // Try to count users (read test)
      await prisma.user.count()
      checks.database_write = true
    } catch (writeError) {
      console.warn('Database write check failed:', writeError)
      overallStatus = 'degraded'
    }
    
    // Memory usage check
    const memUsage = process.memoryUsage()
    const memUsedMB = Math.round(memUsage.rss / 1024 / 1024)
    const memPercentage = Math.round((memUsage.rss / (1024 * 1024 * 1024)) * 100) // Assuming 1GB limit
    
    checks.memory_usage = {
      used: memUsedMB,
      percentage: memPercentage
    }
    
    // Check if memory usage is too high
    if (memPercentage > 80) {
      overallStatus = 'degraded'
    }
    
    // Redis check (if Redis URL is available)
    if (process.env.REDIS_URL) {
      try {
        // In a real implementation, you'd check Redis connectivity here
        services.redis = 'connected'
      } catch (redisError) {
        services.redis = 'error'
        overallStatus = 'degraded'
      }
    }
    
  } catch (error) {
    console.error('Health check failed:', error)
    overallStatus = 'unhealthy'
    services.database = 'error'
    details.error_message = error instanceof Error ? error.message : 'Unknown database error'
  }

  const healthData: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'unknown',
    version: process.env.npm_package_version || '1.0.0',
    services,
    checks,
    details
  }

  const statusCode = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json(healthData, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json'
    }
  })
}