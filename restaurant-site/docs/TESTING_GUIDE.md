# Testing Guide

This guide covers all testing approaches implemented in the restaurant website project.

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Jest with API testing
- **E2E Testing**: Playwright for cross-browser testing
- **Performance Testing**: Lighthouse CI
- **Accessibility Testing**: Built-in Playwright accessibility checks

## Running Tests

### Unit and Integration Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI interface
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/landing-page.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Performance Tests

```bash
# Run Lighthouse audit
npm install -g @lhci/cli
lhci autorun

# Or with custom configuration
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

## Test Structure

```
restaurant-site/
├── src/
│   └── components/
│       └── __tests__/              # Unit tests
│           ├── button.test.tsx
│           ├── header.test.tsx
│           └── promotions-section.test.tsx
├── src/app/api/
│   └── __tests__/                  # API tests
│       ├── promotions.test.ts
│       ├── events.test.ts
│       └── admin-*.test.ts
├── tests/
│   └── e2e/                        # E2E tests
│       ├── landing-page.spec.ts
│       ├── admin-panel.spec.ts
│       └── cross-browser.spec.ts
├── jest.config.js                  # Jest configuration
├── jest.setup.js                   # Jest setup file
└── playwright.config.ts            # Playwright configuration
```

## Cross-Browser Testing

### Supported Browsers

The application is tested across:
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Different viewport sizes**: Mobile, tablet, desktop

### Test Coverage

#### Landing Page Tests (`landing-page.spec.ts`)
- Page loading and rendering
- Navigation functionality
- Responsive design
- Image loading
- Form interactions
- SEO elements

#### Admin Panel Tests (`admin-panel.spec.ts`)
- Authentication flow
- Admin navigation
- CRUD operations (when authenticated)
- Mobile responsiveness
- Accessibility compliance

#### Cross-Browser Compatibility (`cross-browser.spec.ts`)
- CSS rendering consistency
- JavaScript functionality
- Touch event handling
- Font loading
- Animation support
- Form validation
- Viewport responsiveness

## Mobile Device Testing

### Tested Devices
- iPhone 12 (iOS Safari)
- Pixel 5 (Android Chrome)
- iPad (Safari)
- Galaxy S21 (Chrome)

### Mobile-Specific Tests
- Touch gestures and interactions
- Mobile navigation menu
- Viewport adaptation
- Touch-friendly button sizes
- Keyboard behavior on mobile
- Performance on mobile networks

## Accessibility Testing

### Automated Checks
- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA labels and roles
- Form accessibility

### Manual Testing Checklist
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Images have appropriate alt text
- [ ] Form fields have proper labels
- [ ] Color is not the only way to convey information
- [ ] Text has sufficient contrast
- [ ] Content is readable at 200% zoom

## Performance Testing

### Metrics Monitored
- **Core Web Vitals**:
  - Largest Contentful Paint (LCP) < 2.5s
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1

- **Other Metrics**:
  - Time to First Byte (TTFB)
  - First Contentful Paint (FCP)
  - Speed Index
  - Total Blocking Time (TBT)

### Performance Budget
- Bundle size < 500KB (gzipped)
- Initial page load < 3 seconds
- Subsequent navigations < 1 second
- Images optimized with WebP/AVIF format
- Critical CSS inlined

## Test Environments

### Development Testing
```bash
# Start dev server
npm run dev

# Run tests against dev server
npm run test:e2e
```

### Production Testing
```bash
# Build and start production server
npm run build
npm start

# Run tests against production build
BASE_URL=http://localhost:3000 npm run test:e2e
```

### CI/CD Testing
Tests run automatically on:
- Pull requests
- Pushes to main/develop branches
- Scheduled runs (nightly)

## Writing Tests

### Unit Test Example
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toHaveTextContent('Click me')
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('should navigate to about section', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href="#about"]')
  await expect(page.locator('#about')).toBeInViewport()
})
```

### API Test Example
```typescript
import { createMocks } from 'node-mocks-http'
import handler from '../api/promotions/route'

test('GET /api/promotions returns promotions', async () => {
  const { req, res } = createMocks({ method: 'GET' })
  await handler.GET()
  // Assert response
})
```

## Test Data Management

### Mock Data
- Unit tests use mock data defined in test files
- E2E tests use seeded database data
- API tests use mocked Prisma responses

### Database Testing
- Separate test database
- Automatic cleanup after tests
- Seeded with consistent test data

## Debugging Tests

### Jest Debugging
```bash
# Debug specific test
npm test -- --testNamePattern="should render button"

# Run single test file
npm test Button.test.tsx

# Enable verbose output
npm test -- --verbose
```

### Playwright Debugging
```bash
# Open Playwright Inspector
npx playwright test --debug

# Record new test
npx playwright codegen http://localhost:3000

# View test report
npx playwright show-report
```

## Continuous Integration

### GitHub Actions Workflow
- Runs on Node.js 18
- Tests across multiple browsers
- Uploads test artifacts
- Generates test reports
- Fails build on test failures

### Test Reports
- Jest coverage reports uploaded to Codecov
- Playwright HTML reports available as artifacts
- Lighthouse reports for performance tracking

## Best Practices

### Unit Testing
- Test component behavior, not implementation
- Use data-testid for reliable element selection
- Mock external dependencies
- Keep tests isolated and independent

### E2E Testing
- Test user workflows, not individual functions
- Use Page Object Model for complex interactions
- Handle async operations properly
- Test across different browsers and devices

### Performance Testing
- Set realistic performance budgets
- Test on realistic network conditions
- Monitor performance over time
- Address performance regressions immediately

### Accessibility Testing
- Combine automated and manual testing
- Test with actual assistive technologies
- Include accessibility in code review process
- Regular accessibility audits

## Troubleshooting

### Common Issues

#### Test Timeouts
- Increase timeout in Playwright config
- Wait for specific elements instead of arbitrary delays
- Check network conditions

#### Flaky Tests
- Use proper waiting strategies
- Avoid timing-dependent assertions
- Ensure test isolation

#### Browser Launch Failures
```bash
# Reinstall browser binaries
npx playwright install --force

# Check system dependencies
npx playwright install-deps
```

#### Port Conflicts
- Ensure dev server is not running on test port
- Use different ports for testing
- Check for zombie processes

For more details on specific testing scenarios, see the individual test files and their comments.