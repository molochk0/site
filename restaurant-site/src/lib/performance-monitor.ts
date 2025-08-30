/**
 * Performance monitoring utilities for restaurant website
 * Tracks Core Web Vitals and custom metrics
 */

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  customMetrics: Record<string, number>
}

interface PerformanceConfig {
  enableLogging: boolean
  enableReporting: boolean
  sampleRate: number
  apiEndpoint?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics
  private config: PerformanceConfig
  private observers: PerformanceObserver[] = []

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: false,
      sampleRate: 1.0,
      ...config
    }

    this.metrics = {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      customMetrics: {}
    }

    this.init()
  }

  private init() {
    if (typeof window === 'undefined') return

    // Only monitor a sample of sessions
    if (Math.random() > this.config.sampleRate) return

    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeFCP()
    this.observeTTFB()
    this.observeCustomMetrics()

    // Report metrics when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.report()
    })

    // Report metrics on visibility change (tab switch, etc.)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.report()
      }
    })
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        this.metrics.lcp = lastEntry.startTime
        
        if (this.config.enableLogging) {
          console.log('LCP:', this.metrics.lcp)
        }
      })
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('LCP observation not supported:', error)
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        for (const entry of entries) {
          this.metrics.fid = entry.processingStart - entry.startTime
          
          if (this.config.enableLogging) {
            console.log('FID:', this.metrics.fid)
          }
          break // Only need the first FID value
        }
      })
      
      observer.observe({ type: 'first-input', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FID observation not supported:', error)
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        
        this.metrics.cls = clsValue
        
        if (this.config.enableLogging) {
          console.log('CLS:', this.metrics.cls)
        }
      })
      
      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('CLS observation not supported:', error)
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime
          
          if (this.config.enableLogging) {
            console.log('FCP:', this.metrics.fcp)
          }
        }
      })
      
      observer.observe({ type: 'paint', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FCP observation not supported:', error)
    }
  }

  private observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const navigationEntry = entries[0] as PerformanceNavigationTiming
        
        if (navigationEntry) {
          this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
          
          if (this.config.enableLogging) {
            console.log('TTFB:', this.metrics.ttfb)
          }
        }
      })
      
      observer.observe({ type: 'navigation', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('TTFB observation not supported:', error)
    }
  }

  private observeCustomMetrics() {
    // Track restaurant-specific metrics
    this.trackImageLoadTime()
    this.trackAPIResponseTime()
    this.trackFormSubmissionTime()
    this.trackNavigationTime()
  }

  private trackImageLoadTime() {
    const images = document.querySelectorAll('img')
    let imageLoadStart = performance.now()
    let loadedImages = 0

    const onImageLoad = () => {
      loadedImages++
      if (loadedImages === images.length) {
        const imageLoadTime = performance.now() - imageLoadStart
        this.setCustomMetric('imageLoadTime', imageLoadTime)
      }
    }

    images.forEach(img => {
      if (img.complete) {
        onImageLoad()
      } else {
        img.addEventListener('load', onImageLoad)
        img.addEventListener('error', onImageLoad)
      }
    })
  }

  private trackAPIResponseTime() {
    // Monitor API calls
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        const responseTime = endTime - startTime

        if (args[0] && typeof args[0] === 'string' && args[0].includes('/api/')) {
          this.setCustomMetric('apiResponseTime', responseTime)
        }

        return response
      } catch (error) {
        const endTime = performance.now()
        const responseTime = endTime - startTime
        this.setCustomMetric('apiErrorTime', responseTime)
        throw error
      }
    }
  }

  private trackFormSubmissionTime() {
    document.addEventListener('submit', (event) => {
      const startTime = performance.now()
      const form = event.target as HTMLFormElement

      const onFormComplete = () => {
        const endTime = performance.now()
        const submissionTime = endTime - startTime
        this.setCustomMetric('formSubmissionTime', submissionTime)
      }

      // Track form submission completion
      setTimeout(onFormComplete, 0) // Next tick
    })
  }

  private trackNavigationTime() {
    // Track SPA navigation time
    let navigationStart = performance.now()

    const observer = new MutationObserver(() => {
      const navigationTime = performance.now() - navigationStart
      this.setCustomMetric('navigationTime', navigationTime)
      navigationStart = performance.now()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  public setCustomMetric(name: string, value: number) {
    this.metrics.customMetrics[name] = value
    
    if (this.config.enableLogging) {
      console.log(`Custom metric ${name}:`, value)
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public getScore(): { score: number; grade: string; details: Record<string, any> } {
    const scores = {
      lcp: this.scoreMetric(this.metrics.lcp, 2500, 4000),
      fid: this.scoreMetric(this.metrics.fid, 100, 300),
      cls: this.scoreMetric(this.metrics.cls, 0.1, 0.25),
      fcp: this.scoreMetric(this.metrics.fcp, 1800, 3000),
      ttfb: this.scoreMetric(this.metrics.ttfb, 800, 1800)
    }

    const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
    
    return {
      score: Math.round(averageScore),
      grade: this.getGrade(averageScore),
      details: {
        coreWebVitals: { lcp: scores.lcp, fid: scores.fid, cls: scores.cls },
        loadingMetrics: { fcp: scores.fcp, ttfb: scores.ttfb },
        customMetrics: this.metrics.customMetrics
      }
    }
  }

  private scoreMetric(value: number, goodThreshold: number, poorThreshold: number): number {
    if (value <= goodThreshold) return 100
    if (value >= poorThreshold) return 0
    
    // Linear scale between good and poor
    const range = poorThreshold - goodThreshold
    const position = value - goodThreshold
    return Math.max(0, 100 - (position / range) * 100)
  }

  private getGrade(score: number): string {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  public async report() {
    if (!this.config.enableReporting) return

    const report = {
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      metrics: this.metrics,
      score: this.getScore(),
      connectionType: (navigator as any).connection?.effectiveType || 'unknown'
    }

    try {
      if (this.config.apiEndpoint) {
        await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
          keepalive: true
        })
      }
    } catch (error) {
      console.warn('Failed to report performance metrics:', error)
    }

    if (this.config.enableLogging) {
      console.log('Performance Report:', report)
    }
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// React Hook for performance monitoring
export function usePerformanceMonitor(config?: Partial<PerformanceConfig>) {
  if (typeof window === 'undefined') {
    return null
  }

  const monitor = new PerformanceMonitor(config)
  
  return {
    getMetrics: () => monitor.getMetrics(),
    getScore: () => monitor.getScore(),
    setCustomMetric: (name: string, value: number) => monitor.setCustomMetric(name, value),
    report: () => monitor.report(),
    disconnect: () => monitor.disconnect()
  }
}

// Initialize performance monitoring with default configuration
export function initPerformanceMonitoring(config?: Partial<PerformanceConfig>) {
  if (typeof window === 'undefined') return null
  
  return new PerformanceMonitor({
    enableLogging: process.env.NODE_ENV === 'development',
    enableReporting: process.env.NODE_ENV === 'production',
    sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% sampling in prod
    apiEndpoint: '/api/performance',
    ...config
  })
}

export default PerformanceMonitor