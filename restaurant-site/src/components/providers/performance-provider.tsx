'use client'

import { useEffect } from 'react'
import { initPerformanceMonitoring } from '@/lib/performance-monitor'

interface PerformanceProviderProps {
  children: React.ReactNode
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring on client side
    const monitor = initPerformanceMonitoring({
      enableLogging: process.env.NODE_ENV === 'development',
      enableReporting: true, // Always report to gather data
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      apiEndpoint: '/api/performance'
    })

    // Cleanup on unmount
    return () => {
      if (monitor) {
        monitor.disconnect()
      }
    }
  }, [])

  return <>{children}</>
}