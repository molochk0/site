'use client'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const apiCache = new CacheManager()

// Clean up expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Enhanced fetch with caching
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: {
    ttl?: number
    forceRefresh?: boolean
    cacheKey?: string
  } = {}
): Promise<T> {
  const { ttl = 5 * 60 * 1000, forceRefresh = false, cacheKey } = cacheOptions
  const key = cacheKey || `${options.method || 'GET'}:${url}`

  // Return cached data if available and not forcing refresh
  if (!forceRefresh && apiCache.has(key)) {
    const cached = apiCache.get<T>(key)
    if (cached) return cached
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Cache successful responses (only GET requests by default)
    if (!options.method || options.method === 'GET') {
      apiCache.set(key, data, ttl)
    }

    return data
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

/**
 * React hook for cached API requests
 */
import { useState, useEffect } from 'react'

interface UseCachedApiOptions {
  ttl?: number
  enabled?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useCachedApi<T>(
  url: string | null,
  options: UseCachedApiOptions = {}
) {
  const { ttl, enabled = true, onSuccess, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url || !enabled) return

    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await cachedFetch<T>(url, {}, { ttl })
        
        if (!cancelled) {
          setData(result)
          onSuccess?.(result)
        }
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error('Unknown error')
          setError(error)
          onError?.(error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [url, enabled, ttl, onSuccess, onError])

  const refetch = () => {
    if (url) {
      return cachedFetch<T>(url, {}, { ttl, forceRefresh: true })
        .then(result => {
          setData(result)
          return result
        })
        .catch(err => {
          const error = err instanceof Error ? err : new Error('Unknown error')
          setError(error)
          throw error
        })
    }
    return Promise.reject(new Error('No URL provided'))
  }

  return { data, loading, error, refetch }
}

/**
 * Preload API data
 */
export function preloadApi(url: string, options: RequestInit = {}) {
  // Fire and forget - just populate the cache
  cachedFetch(url, options).catch(() => {
    // Silently fail for preloads
  })
}

/**
 * Cache management utilities
 */
export const cacheUtils = {
  // Clear specific cache entry
  invalidate: (key: string) => apiCache.delete(key),
  
  // Clear all cache
  clear: () => apiCache.clear(),
  
  // Get cache statistics
  getStats: () => ({
    size: apiCache['cache'].size,
    keys: Array.from(apiCache['cache'].keys())
  }),
  
  // Warm up cache with common endpoints
  warmUp: (endpoints: string[]) => {
    endpoints.forEach(endpoint => preloadApi(endpoint))
  }
}