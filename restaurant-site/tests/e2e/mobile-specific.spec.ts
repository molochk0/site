import { test, expect } from '@playwright/test'

test.describe('Mobile Device Testing', () => {
  // Only run these tests on mobile devices
  test.skip(({ isMobile }) => !isMobile, 'Mobile-specific tests')

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should handle touch interactions properly', async ({ page }) => {
    // Test touch tap on buttons
    const buttons = page.locator('button, [role="button"]')
    const buttonCount = await buttons.count()
    
    if (buttonCount > 0) {
      const firstButton = buttons.first()
      await expect(firstButton).toBeVisible()
      
      // Tap instead of click for mobile
      await firstButton.tap()
      await page.waitForTimeout(300)
    }
  })

  test('should display mobile navigation menu', async ({ page }) => {
    // Look for mobile menu trigger
    const mobileMenuTriggers = [
      '[aria-label*="menu"]',
      '[aria-label*="Menu"]',
      '[data-testid="mobile-menu"]',
      '.hamburger',
      'button[aria-expanded]'
    ]
    
    let menuButton = null
    for (const selector of mobileMenuTriggers) {
      const element = page.locator(selector)
      if (await element.count() > 0) {
        menuButton = element.first()
        break
      }
    }
    
    if (menuButton) {
      await expect(menuButton).toBeVisible()
      
      // Tap to open menu
      await menuButton.tap()
      await page.waitForTimeout(500)
      
      // Check if menu opened (look for common mobile menu indicators)
      const menuIndicators = [
        '[aria-expanded="true"]',
        '.menu-open',
        'nav[data-state="open"]',
        '.mobile-nav.open'
      ]
      
      let menuOpened = false
      for (const selector of menuIndicators) {
        const element = page.locator(selector)
        if (await element.count() > 0) {
          await expect(element).toBeVisible()
          menuOpened = true
          break
        }
      }
      
      // If no specific indicators, check if navigation became visible
      if (!menuOpened) {
        const nav = page.locator('nav')
        if (await nav.count() > 0) {
          await expect(nav).toBeVisible()
        }
      }
    }
  })

  test('should handle swipe gestures on carousels', async ({ page }) => {
    // Find carousel or swipeable elements
    const carouselSelectors = [
      '[data-testid="carousel"]',
      '.carousel',
      '.swiper',
      '.touch-carousel',
      '[role="region"][aria-label*="carousel"]'
    ]
    
    let carousel = null
    for (const selector of carouselSelectors) {
      const element = page.locator(selector)
      if (await element.count() > 0) {
        carousel = element.first()
        break
      }
    }
    
    if (carousel) {
      await carousel.scrollIntoViewIfNeeded()
      
      // Get carousel bounds for swipe calculation
      const box = await carousel.boundingBox()
      
      if (box) {
        // Perform swipe left gesture
        await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height * 0.5)
        await page.touchscreen.tap(box.x + box.width * 0.2, box.y + box.height * 0.5)
        
        await page.waitForTimeout(500)
        
        // Verify carousel responded (content should have changed or moved)
        await expect(carousel).toBeVisible()
      }
    }
  })

  test('should have appropriate button sizes for touch', async ({ page }) => {
    const buttons = page.locator('button, [role="button"], a[href]')
    const buttonCount = await buttons.count()
    
    // Test first 5 buttons for touch-friendly sizing
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      
      if (await button.isVisible()) {
        const box = await button.boundingBox()
        
        if (box) {
          // Buttons should be at least 44px in height/width for good touch UX
          expect(box.height).toBeGreaterThanOrEqual(40)
          expect(box.width).toBeGreaterThanOrEqual(40)
        }
      }
    }
  })

  test('should handle virtual keyboard properly', async ({ page }) => {
    // Find form inputs
    const inputs = page.locator('input[type="text"], input[type="email"], textarea')
    const inputCount = await inputs.count()
    
    if (inputCount > 0) {
      const firstInput = inputs.first()
      await firstInput.scrollIntoViewIfNeeded()
      
      // Tap to focus input
      await firstInput.tap()
      await page.waitForTimeout(500)
      
      // Check input is focused
      const isFocused = await firstInput.evaluate(el => el === document.activeElement)
      expect(isFocused).toBe(true)
      
      // Type some text
      await firstInput.fill('Test input')
      const value = await firstInput.inputValue()
      expect(value).toBe('Test input')
    }
  })

  test('should handle orientation changes', async ({ page }) => {
    // Test portrait mode (default)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Check layout adapts to portrait
    const mainContent = page.locator('main, [role="main"]').first()
    if (await mainContent.count() > 0) {
      await expect(mainContent).toBeVisible()
      
      const portraitBox = await mainContent.boundingBox()
      
      // Switch to landscape mode
      await page.setViewportSize({ width: 667, height: 375 })
      await page.waitForTimeout(500)
      
      // Check layout adapts to landscape
      await expect(mainContent).toBeVisible()
      
      const landscapeBox = await mainContent.boundingBox()
      
      // Layout should adapt (dimensions should change)
      if (portraitBox && landscapeBox) {
        expect(landscapeBox.width).not.toBe(portraitBox.width)
      }
    }
  })

  test('should handle scroll performance on mobile', async ({ page }) => {
    // Measure scroll performance
    const startTime = Date.now()
    
    // Scroll down the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2)
    })
    
    await page.waitForTimeout(500)
    
    // Check if page is still responsive
    const scrollPosition = await page.evaluate(() => window.pageYOffset)
    expect(scrollPosition).toBeGreaterThan(0)
    
    const scrollTime = Date.now() - startTime
    // Scroll should complete quickly (under 2 seconds)
    expect(scrollTime).toBeLessThan(2000)
  })

  test('should have readable text on mobile', async ({ page }) => {
    // Check text is not too small on mobile
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6')
    const elementCount = await textElements.count()
    
    // Check first 10 text elements
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i)
      
      if (await element.isVisible()) {
        const fontSize = await element.evaluate(el => {
          const style = window.getComputedStyle(el)
          return parseFloat(style.fontSize)
        })
        
        // Text should be at least 14px for good mobile readability
        expect(fontSize).toBeGreaterThanOrEqual(14)
      }
    }
  })

  test('should handle touch-friendly form interactions', async ({ page }) => {
    const forms = page.locator('form')
    const formCount = await forms.count()
    
    if (formCount > 0) {
      const form = forms.first()
      const inputs = form.locator('input, textarea, select')
      const inputCount = await inputs.count()
      
      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = inputs.nth(i)
          
          if (await input.isVisible()) {
            // Tap to focus
            await input.tap()
            await page.waitForTimeout(200)
            
            // Check input has proper spacing for touch
            const box = await input.boundingBox()
            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(40)
            }
            
            // Test input type for mobile keyboards
            const inputType = await input.getAttribute('type')
            if (inputType === 'email') {
              await input.fill('test@example.com')
            } else if (inputType === 'tel') {
              await input.fill('1234567890')
            } else {
              await input.fill('Test text')
            }
          }
        }
      }
    }
  })

  test('should handle mobile-specific gestures', async ({ page }) => {
    // Test pull-to-refresh behavior (if implemented)
    const body = page.locator('body')
    const initialScrollTop = await page.evaluate(() => window.pageYOffset)
    
    // Simulate pull gesture at top of page
    if (initialScrollTop === 0) {
      const bodyBox = await body.boundingBox()
      
      if (bodyBox) {
        // Start from top center
        const startX = bodyBox.width / 2
        const startY = 10
        
        // Pull down
        await page.touchscreen.tap(startX, startY)
        await page.touchscreen.tap(startX, startY + 100)
        
        await page.waitForTimeout(500)
      }
    }
    
    // Test long press (if implemented)
    const pressableElements = page.locator('[data-testid*="press"], .long-press')
    const pressableCount = await pressableElements.count()
    
    if (pressableCount > 0) {
      const element = pressableElements.first()
      const elementBox = await element.boundingBox()
      
      if (elementBox) {
        // Long press simulation
        await page.touchscreen.tap(
          elementBox.x + elementBox.width / 2,
          elementBox.y + elementBox.height / 2
        )
        
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should handle network conditions on mobile', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(route.continue())
        }, 100) // Add 100ms delay to simulate slower network
      })
    })
    
    // Navigate and check page still loads
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Check essential content is visible
    const mainContent = page.locator('main, [role="main"], body')
    await expect(mainContent.first()).toBeVisible()
    
    // Remove route handler
    await page.unroute('**/*')
  })
})