import { test, expect, Page } from '@playwright/test'

/**
 * Performance testing suite for restaurant website
 * Tests Core Web Vitals and performance metrics
 */

test.describe('Performance Audit', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Inject performance observers
      ;(window as any).performanceMetrics = {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0
      }

      // Largest Contentful Paint observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        ;(window as any).performanceMetrics.lcp = lastEntry.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })

      // First Contentful Paint observer  
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          ;(window as any).performanceMetrics.fcp = fcpEntry.startTime
        }
      }).observe({ type: 'paint', buffered: true })

      // Cumulative Layout Shift observer
      new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        ;(window as any).performanceMetrics.cls = clsValue
      }).observe({ type: 'layout-shift', buffered: true })

      // Time to First Byte
      new PerformanceObserver((list) => {
        const navigationEntry = list.getEntries()[0] as PerformanceNavigationTiming
        ;(window as any).performanceMetrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      }).observe({ type: 'navigation', buffered: true })
    })
  })

  test('should meet Core Web Vitals thresholds on homepage', async () => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Allow time for LCP measurement

    // Get performance metrics
    const metrics = await page.evaluate(() => (window as any).performanceMetrics)

    // Assert Core Web Vitals thresholds
    expect(metrics.lcp).toBeLessThan(2500) // LCP should be < 2.5s
    expect(metrics.fcp).toBeLessThan(1800) // FCP should be < 1.8s  
    expect(metrics.cls).toBeLessThan(0.1) // CLS should be < 0.1
    expect(metrics.ttfb).toBeLessThan(600) // TTFB should be < 600ms

    console.log('Core Web Vitals:', metrics)
  })

  test('should load critical resources quickly', async () => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for critical resources
    await page.waitForSelector('header')
    await page.waitForSelector('[data-testid="hero-section"]')
    
    const loadTime = Date.now() - startTime
    
    // Critical resources should load within 2 seconds
    expect(loadTime).toBeLessThan(2000)
    
    console.log(`Critical resources loaded in: ${loadTime}ms`)
  })

  test('should optimize image loading performance', async () => {
    await page.goto('/')
    
    // Check that images use proper optimization
    const images = await page.locator('img').all()
    
    for (const img of images) {
      const src = await img.getAttribute('src')
      const loading = await img.getAttribute('loading')
      const sizes = await img.getAttribute('sizes')
      
      // Next.js Image optimization checks
      if (src && !src.startsWith('data:')) {
        // Should use Next.js image optimization or external CDN
        expect(src.includes('/_next/image') || src.includes('unsplash.com') || src.includes('cloudinary.com')).toBeTruthy()
      }
      
      // Should use lazy loading for non-critical images
      if (loading) {
        expect(loading).toBe('lazy')
      }
    }
  })

  test('should handle scroll performance efficiently', async () => {
    await page.goto('/')
    
    const startTime = performance.now()
    
    // Simulate scrolling through the page
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let scrollPosition = 0
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const scrollStep = 100
        
        const scrollInterval = setInterval(() => {
          scrollPosition += scrollStep
          window.scrollTo(0, scrollPosition)
          
          if (scrollPosition >= maxScroll) {
            clearInterval(scrollInterval)
            resolve()
          }
        }, 16) // ~60fps
      })
    })
    
    const scrollTime = performance.now() - startTime
    
    // Scrolling should be smooth (complete within reasonable time)
    expect(scrollTime).toBeLessThan(5000)
    
    console.log(`Scroll performance test completed in: ${scrollTime}ms`)
  })

  test('should maintain good performance on mobile viewport', async ({ page: mobilePage }) => {
    // Set mobile viewport
    await mobilePage.setViewportSize({ width: 375, height: 667 })
    
    const startTime = Date.now()
    await mobilePage.goto('/')
    await mobilePage.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Mobile should load within 3 seconds even with slower connection simulation
    expect(loadTime).toBeLessThan(3000)
    
    // Check mobile-specific optimizations
    const touchElements = await mobilePage.locator('[role="button"], button').all()
    
    for (const element of touchElements) {
      const boundingBox = await element.boundingBox()
      if (boundingBox) {
        // Touch targets should be at least 44px
        expect(Math.min(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(44)
      }
    }
    
    console.log(`Mobile load time: ${loadTime}ms`)
  })

  test('should optimize admin panel performance', async () => {
    // Test admin panel performance
    await page.goto('/admin')
    
    // Should redirect to login or load admin dashboard
    const currentUrl = page.url()
    expect(currentUrl.includes('/admin') || currentUrl.includes('/auth')).toBeTruthy()
    
    if (currentUrl.includes('/auth')) {
      // Login page should load quickly
      await page.waitForSelector('form')
      const loginForm = await page.locator('form').first()
      expect(loginForm).toBeVisible()
    } else {
      // Admin dashboard should load efficiently
      await page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 5000 })
    }
  })

  test('should handle concurrent API requests efficiently', async () => {
    await page.goto('/')
    
    // Simulate multiple API requests
    const apiPromises = [
      page.evaluate(() => fetch('/api/promotions')),
      page.evaluate(() => fetch('/api/events')),
      page.evaluate(() => fetch('/api/content'))
    ]
    
    const startTime = performance.now()
    const responses = await Promise.all(apiPromises)
    const requestTime = performance.now() - startTime
    
    // All API requests should complete quickly
    expect(requestTime).toBeLessThan(1000)
    
    // All requests should be successful
    for (const response of responses) {
      expect(response.ok).toBeTruthy()
    }
    
    console.log(`API requests completed in: ${requestTime}ms`)
  })

  test('should optimize bundle size and loading', async () => {
    // Capture network requests
    const responses: any[] = []
    
    page.on('response', (response) => {
      if (response.url().includes('/_next/static/')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'],
          status: response.status()
        })
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check JavaScript bundle sizes
    const jsFiles = responses.filter(r => r.url.includes('.js'))
    const totalJSSize = jsFiles.reduce((sum, file) => {
      return sum + (parseInt(file.size || '0') || 0)
    }, 0)
    
    // Total JS should be reasonable for a restaurant site
    expect(totalJSSize).toBeLessThan(500000) // 500KB limit
    
    console.log(`Total JS bundle size: ${totalJSSize} bytes`)
    console.log(`Number of JS files: ${jsFiles.length}`)
  })
})

test.describe('Performance Edge Cases', () => {
  test('should handle slow network conditions gracefully', async ({ page }) => {
    // Simulate slow 3G connection
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Add 100ms delay
      await route.continue()
    })
    
    const startTime = Date.now()
    await page.goto('/')
    
    // Should show loading states or skeleton screens
    const hasLoadingStates = await page.locator('[data-testid="loading"], .animate-pulse, .skeleton').count()
    expect(hasLoadingStates).toBeGreaterThan(0)
    
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`Slow network load time: ${loadTime}ms`)
  })

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
    })
    
    // Simulate user interactions that could cause memory leaks
    for (let i = 0; i < 10; i++) {
      await page.click('button:visible', { force: true })
      await page.waitForTimeout(100)
      await page.keyboard.press('Escape') // Close any modals
      await page.waitForTimeout(100)
    }
    
    // Force garbage collection if possible
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc()
      }
    })
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
    })
    
    // Memory usage shouldn't grow significantly
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory
      expect(memoryGrowth).toBeLessThan(5000000) // 5MB limit
      console.log(`Memory growth: ${memoryGrowth} bytes`)
    }
  })
})