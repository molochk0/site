import { NextRequest, NextResponse } from 'next/server'

/**
 * Performance metrics collection endpoint
 * Collects real user monitoring (RUM) data
 */

interface PerformanceReport {
  url: string
  timestamp: number
  userAgent: string
  metrics: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
    customMetrics: Record<string, number>
  }
  score: {
    score: number
    grade: string
    details: Record<string, any>
  }
  connectionType: string
}

// In production, you might want to store this in a database or analytics service
const performanceReports: PerformanceReport[] = []

export async function POST(request: NextRequest) {
  try {
    const report: PerformanceReport = await request.json()

    // Validate the report structure
    if (!report.url || !report.metrics || !report.timestamp) {
      return NextResponse.json(
        { success: false, error: 'Invalid report format' },
        { status: 400 }
      )
    }

    // Store the report (in production, use a database)
    performanceReports.push({
      ...report,
      timestamp: Date.now() // Server timestamp for accuracy
    })

    // Keep only the last 1000 reports in memory
    if (performanceReports.length > 1000) {
      performanceReports.splice(0, performanceReports.length - 1000)
    }

    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      const { metrics, score } = report
      
      console.log('🚀 Performance Report Received:')
      console.log(`📊 Score: ${score.score} (${score.grade})`)
      console.log(`🌐 URL: ${report.url}`)
      console.log(`📈 Metrics:`, {
        LCP: `${metrics.lcp.toFixed(0)}ms`,
        FID: `${metrics.fid.toFixed(0)}ms`,
        CLS: metrics.cls.toFixed(3),
        FCP: `${metrics.fcp.toFixed(0)}ms`,
        TTFB: `${metrics.ttfb.toFixed(0)}ms`
      })

      // Warn about poor performance
      if (score.score < 70) {
        console.warn('⚠️ Poor performance detected!')
        if (metrics.lcp > 2500) console.warn('  - LCP is too high (>2.5s)')
        if (metrics.fid > 100) console.warn('  - FID is too high (>100ms)')
        if (metrics.cls > 0.1) console.warn('  - CLS is too high (>0.1)')
        if (metrics.fcp > 1800) console.warn('  - FCP is too high (>1.8s)')
        if (metrics.ttfb > 800) console.warn('  - TTFB is too high (>800ms)')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing performance report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const url = searchParams.get('url')

  try {
    let reports = performanceReports
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .slice(0, Math.min(limit, 100)) // Max 100 reports

    // Filter by URL if specified
    if (url) {
      reports = reports.filter(report => report.url.includes(url))
    }

    // Calculate aggregated metrics
    const aggregatedMetrics = calculateAggregatedMetrics(reports)

    return NextResponse.json({
      success: true,
      data: {
        reports: reports.map(report => ({
          url: report.url,
          timestamp: report.timestamp,
          score: report.score,
          metrics: report.metrics,
          connectionType: report.connectionType
        })),
        aggregated: aggregatedMetrics,
        total: reports.length
      }
    })
  } catch (error) {
    console.error('Error fetching performance reports:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

function calculateAggregatedMetrics(reports: PerformanceReport[]) {
  if (reports.length === 0) {
    return null
  }

  const metrics = {
    lcp: { values: reports.map(r => r.metrics.lcp) },
    fid: { values: reports.map(r => r.metrics.fid) },
    cls: { values: reports.map(r => r.metrics.cls) },
    fcp: { values: reports.map(r => r.metrics.fcp) },
    ttfb: { values: reports.map(r => r.metrics.ttfb) }
  }

  const scores = reports.map(r => r.score.score)

  const calculateStats = (values: number[]) => ({
    avg: values.reduce((sum, val) => sum + val, 0) / values.length,
    p50: percentile(values, 50),
    p75: percentile(values, 75),
    p95: percentile(values, 95),
    min: Math.min(...values),
    max: Math.max(...values)
  })

  return {
    period: {
      from: Math.min(...reports.map(r => r.timestamp)),
      to: Math.max(...reports.map(r => r.timestamp)),
      count: reports.length
    },
    coreWebVitals: {
      lcp: calculateStats(metrics.lcp.values),
      fid: calculateStats(metrics.fid.values),
      cls: calculateStats(metrics.cls.values)
    },
    loadingMetrics: {
      fcp: calculateStats(metrics.fcp.values),
      ttfb: calculateStats(metrics.ttfb.values)
    },
    overallScore: calculateStats(scores),
    gradeDistribution: getGradeDistribution(scores),
    deviceTypes: getDeviceTypeDistribution(reports),
    connectionTypes: getConnectionTypeDistribution(reports)
  }
}

function percentile(values: number[], p: number): number {
  const sorted = values.slice().sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

function getGradeDistribution(scores: number[]) {
  const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 }
  
  scores.forEach(score => {
    if (score >= 90) grades.A++
    else if (score >= 80) grades.B++
    else if (score >= 70) grades.C++
    else if (score >= 60) grades.D++
    else grades.F++
  })

  return grades
}

function getDeviceTypeDistribution(reports: PerformanceReport[]) {
  const devices = { mobile: 0, desktop: 0, tablet: 0 }
  
  reports.forEach(report => {
    const ua = report.userAgent.toLowerCase()
    if (/mobile|android|iphone/.test(ua)) {
      devices.mobile++
    } else if (/tablet|ipad/.test(ua)) {
      devices.tablet++
    } else {
      devices.desktop++
    }
  })

  return devices
}

function getConnectionTypeDistribution(reports: PerformanceReport[]) {
  const connections: Record<string, number> = {}
  
  reports.forEach(report => {
    const type = report.connectionType || 'unknown'
    connections[type] = (connections[type] || 0) + 1
  })

  return connections
}