module.exports = {
  ci: {
    collect: {
      // Start the local server before running Lighthouse
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000', 'http://localhost:3000/admin'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: ['--no-sandbox', '--disable-dev-shm-usage'],
        // Preset configurations for different types of audits
        preset: 'desktop',
        // Custom settings for restaurant site
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      // Performance budgets - Core Web Vitals
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Core Web Vitals thresholds
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        'max-potential-fid': ['warn', { maxNumericValue: 130 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxLength: 0 }],
        'unused-javascript': ['warn', { maxLength: 0 }],
        'render-blocking-resources': ['warn', { maxLength: 0 }],
        'uses-optimized-images': 'error',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'error',
        'efficient-animated-content': 'warn',
        
        // Performance best practices
        'uses-text-compression': 'error',
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        'preload-lcp-image': 'warn',
        'total-byte-weight': ['warn', { maxNumericValue: 1600000 }], // 1.6MB
        
        // Accessibility requirements
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',
        
        // SEO requirements
        'document-title': 'error',
        'meta-description': 'error',
        'link-text': 'error',
        'is-crawlable': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9009,
      storage: './lighthouse-reports'
    }
  }
}