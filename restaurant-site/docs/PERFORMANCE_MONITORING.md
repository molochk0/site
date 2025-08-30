# Performance Monitoring Documentation

This document describes the performance monitoring system implemented for the restaurant website, including Core Web Vitals tracking, Lighthouse CI integration, and real-time monitoring capabilities.

## Overview

The performance monitoring system tracks key metrics to ensure optimal user experience:

- **Core Web Vitals**: LCP, FID, CLS
- **Loading Metrics**: FCP, TTFB
- **Custom Metrics**: API response times, image load times, form submissions
- **Device Analytics**: Mobile, desktop, tablet performance
- **Network Analysis**: Connection type impact on performance

## Components

### 1. Performance Monitor (`src/lib/performance-monitor.ts`)

Core monitoring utility that tracks real user monitoring (RUM) data:

```typescript
import { initPerformanceMonitoring } from '@/lib/performance-monitor'

// Initialize with default settings
const monitor = initPerformanceMonitoring({
  enableLogging: true,
  enableReporting: true,
  sampleRate: 0.1, // 10% sampling in production
  apiEndpoint: '/api/performance'
})
```

**Features:**
- Automatic Core Web Vitals tracking
- Custom metric collection
- Performance scoring system (A-F grades)
- Real-time data reporting

### 2. Performance Provider (`src/components/providers/performance-provider.tsx`)

React context provider for application-wide monitoring:

```tsx
<PerformanceProvider>
  {children}
</PerformanceProvider>
```

Automatically initializes monitoring when component mounts and handles cleanup.

### 3. Performance API (`src/app/api/performance/route.ts`)

RESTful API for collecting and retrieving performance data:

- `POST /api/performance` - Submit performance reports
- `GET /api/performance` - Retrieve aggregated metrics

**Sample API Response:**
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "aggregated": {
      "coreWebVitals": {
        "lcp": { "avg": 1500, "p95": 2000 },
        "fid": { "avg": 50, "p95": 100 },
        "cls": { "avg": 0.05, "p95": 0.1 }
      }
    }
  }
}
```

### 4. Performance Dashboard (`src/components/admin/performance-dashboard.tsx`)

Admin interface for monitoring website performance:

**Features:**
- Real-time Core Web Vitals display
- Performance score overview
- Device and connection type analytics
- Performance recommendations
- Historical trend analysis

**Access:** `/admin/performance`

## Lighthouse CI Integration

### Configuration (`lighthouserc.js`)

Automated performance testing configuration:

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/admin'],
      numberOfRuns: 3,
      preset: 'desktop'
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }]
      }
    }
  }
}
```

### Performance Budget (`performance-budget.json`)

Resource and timing constraints:

- **LCP**: < 2.5 seconds
- **FID**: < 100ms 
- **CLS**: < 0.1
- **JavaScript**: < 400KB
- **Images**: < 800KB
- **Total Size**: < 1.6MB

### NPM Scripts

```bash
# Run Lighthouse CI
npm run lighthouse:ci

# Run performance tests
npm run test:performance

# Combined performance audit
npm run performance:audit

# Local Lighthouse report
npm run lighthouse:local
```

## Performance Testing

### Playwright Performance Tests (`tests/e2e/performance.spec.ts`)

Comprehensive performance testing suite:

```typescript
test('should meet Core Web Vitals thresholds', async ({ page }) => {
  await page.goto('/')
  const metrics = await page.evaluate(() => window.performanceMetrics)
  
  expect(metrics.lcp).toBeLessThan(2500)
  expect(metrics.fid).toBeLessThan(100)
  expect(metrics.cls).toBeLessThan(0.1)
})
```

**Test Categories:**
- Core Web Vitals validation
- Critical resource loading
- Image optimization checks
- Scroll performance
- Mobile viewport testing
- Memory usage monitoring

### CI/CD Integration (`.github/workflows/performance.yml`)

Automated performance monitoring in GitHub Actions:

- Runs on every PR and push to main
- Daily scheduled performance audits
- Artifacts saved for historical analysis
- Performance regression detection
- Automatic PR comments with results

## Performance Thresholds

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |

### Loading Metrics

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| FCP | ≤ 1.8s | ≤ 3.0s | > 3.0s |
| TTFB | ≤ 800ms | ≤ 1.8s | > 1.8s |

### Resource Budgets

| Resource Type | Budget |
|---------------|--------|
| JavaScript | 400KB |
| CSS | 100KB |
| Images | 800KB |
| Fonts | 200KB |
| Total | 1.6MB |

## Real User Monitoring (RUM)

### Data Collection

Performance data is collected from real users:

- **Sampling**: 10% of production traffic
- **Storage**: In-memory (production should use database)
- **Retention**: Last 1000 reports
- **Privacy**: No personal data collected

### Metrics Tracked

1. **Navigation Performance**
   - Page load times
   - Resource loading
   - Network timing

2. **Interaction Performance**
   - Form submission times
   - API response times
   - Navigation transitions

3. **Visual Performance**
   - Image load completion
   - Layout stability
   - Rendering metrics

## Performance Optimization Recommendations

### Implemented Optimizations

1. **Image Optimization**
   - Next.js Image component usage
   - Lazy loading for non-critical images
   - WebP format support
   - Responsive image sizing

2. **Code Splitting**
   - Dynamic imports for components
   - Route-based code splitting
   - Bundle analysis tools

3. **Caching Strategy**
   - API response caching
   - Static asset optimization
   - Browser caching headers

4. **Loading Optimizations**
   - Critical resource prioritization
   - Preloading key assets
   - Progressive enhancement

### Future Optimizations

1. **Advanced Caching**
   - Service Worker implementation
   - Edge caching strategy
   - Background sync

2. **Performance Monitoring**
   - Error tracking integration
   - Performance alerts
   - Automated optimization

3. **User Experience**
   - Loading state improvements
   - Skeleton screens
   - Progressive image loading

## Monitoring Dashboard

The performance dashboard (`/admin/performance`) provides:

### Overview Metrics
- Overall performance score (0-100)
- Grade distribution (A-F)
- Report count and time period

### Core Web Vitals
- LCP, FID, CLS averages and percentiles
- Status indicators (good/needs improvement/poor)
- Historical trends

### Device Analytics
- Mobile vs desktop performance
- Connection type impact
- Device-specific optimizations

### Recommendations
- Automated performance suggestions
- Prioritized improvement areas
- Implementation guidance

## Troubleshooting

### Common Issues

1. **High LCP Values**
   - Check server response times
   - Optimize critical images
   - Review resource loading order

2. **Poor FID Scores**
   - Reduce JavaScript execution time
   - Split code bundles
   - Use Web Workers for heavy tasks

3. **Layout Shift Problems**
   - Set explicit image dimensions
   - Reserve space for dynamic content
   - Avoid inserting content above existing

### Debugging Tools

1. **Browser DevTools**
   - Performance tab analysis
   - Network timing review
   - Coverage analysis

2. **Lighthouse Reports**
   - Local development testing
   - CI/CD integration results
   - Performance recommendations

3. **Real User Monitoring**
   - Production performance data
   - User behavior insights
   - Performance trends

## Conclusion

This performance monitoring system provides comprehensive insights into website performance, enabling data-driven optimization decisions and ensuring excellent user experience across all devices and network conditions.

Regular monitoring and optimization based on these metrics will help maintain high performance standards and improve Core Web Vitals scores over time.