import { test, expect } from '@playwright/test'

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should render CSS properly across browsers', async ({ page, browserName }) => {
    // Wait for CSS to load
    await page.waitForLoadState('networkidle')
    
    // Check that main elements have proper styling
    const header = page.locator('header, nav').first()
    if (await header.count() > 0) {
      const headerStyles = await header.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          display: computed.display,
          position: computed.position,
          backgroundColor: computed.backgroundColor
        }
      })
      
      expect(headerStyles.display).not.toBe('none')
      console.log(`${browserName} header styles:`, headerStyles)
    }
    
    // Check hero section styling
    const hero = page.locator('#home, [data-testid="hero"]').first()
    if (await hero.count() > 0) {
      const heroStyles = await hero.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          minHeight: computed.minHeight,
          backgroundImage: computed.backgroundImage,
          display: computed.display
        }
      })
      
      expect(heroStyles.display).not.toBe('none')
      console.log(`${browserName} hero styles:`, heroStyles)
    }
  })

  test('should handle JavaScript features across browsers', async ({ page, browserName }) => {
    // Test smooth scrolling
    const aboutSection = page.locator('#about')
    if (await aboutSection.count() > 0) {
      // Click a navigation link that should scroll
      const aboutLink = page.locator('a[href="#about"]').first()
      if (await aboutLink.count() > 0) {
        await aboutLink.click()
        await page.waitForTimeout(1000)
        
        // Check if section is in view
        await expect(aboutSection).toBeInViewport()
      }
    }
    
    // Test form interactions
    const contactForm = page.locator('form').first()
    if (await contactForm.count() > 0) {
      const nameInput = contactForm.locator('input[name="name"], input[placeholder*="имя"]').first()
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test Name')
        const value = await nameInput.inputValue()
        expect(value).toBe('Test Name')
      }
    }
  })

  test('should handle mobile touch events properly', async ({ page, isMobile }) => {
    if (isMobile) {
      // Test touch interactions on mobile
      const cards = page.locator('[role="button"], button, .card')
      const cardCount = await cards.count()
      
      if (cardCount > 0) {
        const firstCard = cards.first()
        
        // Simulate touch tap
        await firstCard.tap()
        await page.waitForTimeout(500)
        
        // Check for any visual feedback or state change
        await expect(firstCard).toBeVisible()
      }
      
      // Test mobile menu if present
      const mobileMenuButton = page.locator('[aria-label*="menu"], [data-testid="mobile-menu"]')
      if (await mobileMenuButton.count() > 0) {
        await mobileMenuButton.tap()
        await page.waitForTimeout(500)
        
        // Check if menu opened
        const mobileNav = page.locator('nav[aria-expanded="true"], .mobile-menu-open')
        if (await mobileNav.count() > 0) {
          await expect(mobileNav).toBeVisible()
        }
      }
    }
  })

  test('should load fonts properly across browsers', async ({ page, browserName }) => {
    await page.waitForLoadState('networkidle')
    
    // Check if custom fonts are loaded
    const fontFaces = await page.evaluate(() => {
      return Array.from(document.fonts.values()).map(font => ({
        family: font.family,
        status: font.status,
        weight: font.weight,
        style: font.style
      }))
    })
    
    console.log(`${browserName} loaded fonts:`, fontFaces)
    
    // Check that text is visible (not using fallback invisible fonts)
    const headings = page.locator('h1, h2, h3')
    const headingCount = await headings.count()
    
    for (let i = 0; i < Math.min(headingCount, 3); i++) {
      const heading = headings.nth(i)
      const fontSize = await heading.evaluate(el => {
        return window.getComputedStyle(el).fontSize
      })
      
      // Font size should be reasonable (not 0 or extremely small)
      const fontSizeValue = parseFloat(fontSize)
      expect(fontSizeValue).toBeGreaterThan(10)
    }
  })

  test('should handle animations and transitions properly', async ({ page, browserName }) => {
    // Test CSS animations work
    const animatedElements = page.locator('.animate-pulse, .animate-bounce, [class*="animate"]')
    const animatedCount = await animatedElements.count()
    
    if (animatedCount > 0) {
      const firstAnimated = animatedElements.first()
      
      // Check element is visible
      await expect(firstAnimated).toBeVisible()
      
      // Check if CSS animations are supported
      const supportsAnimations = await page.evaluate(() => {
        const testEl = document.createElement('div')
        testEl.style.animation = 'test 1s'
        return testEl.style.animation !== ''
      })
      
      console.log(`${browserName} supports CSS animations:`, supportsAnimations)
    }
    
    // Test scroll-triggered animations if present
    const scrollElements = page.locator('[data-aos], .fade-in, .slide-in')
    const scrollCount = await scrollElements.count()
    
    if (scrollCount > 0) {
      const scrollElement = scrollElements.first()
      
      // Scroll element into view
      await scrollElement.scrollIntoViewIfNeeded()
      await page.waitForTimeout(1000)
      
      // Check element is visible after scroll
      await expect(scrollElement).toBeVisible()
    }
  })

  test('should handle form validation consistently', async ({ page, browserName }) => {
    const forms = page.locator('form')
    const formCount = await forms.count()
    
    if (formCount > 0) {
      const form = forms.first()
      
      // Find required fields
      const requiredInputs = form.locator('input[required], textarea[required]')
      const requiredCount = await requiredInputs.count()
      
      if (requiredCount > 0) {
        // Try submitting form without filling required fields
        const submitButton = form.locator('button[type="submit"], input[type="submit"]').first()
        
        if (await submitButton.count() > 0) {
          await submitButton.click()
          
          // Check if browser shows validation messages
          const validationSupported = await page.evaluate(() => {
            const input = document.querySelector('input[required]') as HTMLInputElement
            return input ? input.validity !== undefined : false
          })
          
          console.log(`${browserName} supports HTML5 validation:`, validationSupported)
        }
      }
    }
  })

  test('should handle different viewport sizes', async ({ page, viewport }) => {
    if (viewport) {
      console.log(`Testing viewport: ${viewport.width}x${viewport.height}`)
      
      // Check responsive behavior
      const isSmallScreen = viewport.width < 768
      const isMediumScreen = viewport.width >= 768 && viewport.width < 1024
      const isLargeScreen = viewport.width >= 1024
      
      // Check navigation adapts to screen size
      const nav = page.locator('nav').first()
      if (await nav.count() > 0) {
        const navDisplay = await nav.evaluate(el => 
          window.getComputedStyle(el).display
        )
        
        expect(navDisplay).not.toBe('none')
        
        if (isSmallScreen) {
          // Mobile navigation should be different
          const mobileMenu = page.locator('[aria-label*="menu"], .mobile-menu')
          if (await mobileMenu.count() > 0) {
            await expect(mobileMenu).toBeVisible()
          }
        }
      }
      
      // Check that content is readable at all sizes
      const mainContent = page.locator('main, [role="main"]').first()
      if (await mainContent.count() > 0) {
        const contentBox = await mainContent.boundingBox()
        if (contentBox) {
          expect(contentBox.width).toBeGreaterThan(0)
          expect(contentBox.height).toBeGreaterThan(0)
        }
      }
    }
  })
})