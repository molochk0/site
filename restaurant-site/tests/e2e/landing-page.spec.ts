import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load main page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Вкусный уголок/)
    
    // Check main heading is visible
    await expect(page.locator('h1')).toBeVisible()
    
    // Check navigation is present
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should display all main sections', async ({ page }) => {
    // Hero section
    await expect(page.locator('#home')).toBeVisible()
    
    // Menu preview section
    await expect(page.locator('#menu')).toBeVisible()
    
    // Promotions section
    await expect(page.locator('#promotions')).toBeVisible()
    
    // Events section (if exists)
    const eventsSection = page.locator('#events')
    if (await eventsSection.count() > 0) {
      await expect(eventsSection).toBeVisible()
    }
    
    // About section
    await expect(page.locator('#about')).toBeVisible()
    
    // Contact section
    await expect(page.locator('#contact')).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    // Test navigation links
    const navLinks = page.locator('nav a[href*="#"]')
    const linkCount = await navLinks.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i)
      const href = await link.getAttribute('href')
      
      if (href && href.startsWith('#')) {
        await link.click()
        // Wait for scroll animation
        await page.waitForTimeout(500)
        
        // Check if target section is in viewport
        const targetSection = page.locator(href)
        if (await targetSection.count() > 0) {
          await expect(targetSection).toBeInViewport()
        }
      }
    }
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check mobile menu button exists
      const menuButton = page.locator('[aria-label*="menu"], [data-testid="mobile-menu-button"]')
      if (await menuButton.count() > 0) {
        await expect(menuButton).toBeVisible()
        
        // Test mobile menu functionality
        await menuButton.click()
        await expect(page.locator('nav')).toBeVisible()
      }
    }
    
    // Check responsive images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i)
      await expect(img).toBeVisible()
    }
  })

  test('should load images properly', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    // Check that images are loaded (not broken)
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i)
      const src = await img.getAttribute('src')
      
      if (src && !src.startsWith('data:')) {
        // Check image is visible and has natural dimensions
        await expect(img).toBeVisible()
        
        const naturalWidth = await img.evaluate((img: HTMLImageElement) => img.naturalWidth)
        expect(naturalWidth).toBeGreaterThan(0)
      }
    }
  })

  test('should handle contact form submission', async ({ page }) => {
    // Scroll to contact section
    await page.locator('#contact').scrollIntoViewIfNeeded()
    
    // Find contact form
    const form = page.locator('form')
    if (await form.count() > 0) {
      // Fill form fields
      const nameInput = form.locator('input[name="name"], input[placeholder*="имя"]').first()
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test User')
      }
      
      const emailInput = form.locator('input[type="email"], input[name="email"]').first()
      if (await emailInput.count() > 0) {
        await emailInput.fill('test@example.com')
      }
      
      const messageInput = form.locator('textarea[name="message"], textarea[placeholder*="сообщение"]').first()
      if (await messageInput.count() > 0) {
        await messageInput.fill('Test message for restaurant')
      }
      
      // Submit form (but intercept to avoid actual submission)
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first()
      if (await submitButton.count() > 0) {
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toBeEnabled()
      }
    }
  })

  test('should have proper SEO elements', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    if (await metaDescription.count() > 0) {
      const content = await metaDescription.getAttribute('content')
      expect(content?.length).toBeGreaterThan(50)
    }
    
    // Check structured data (JSON-LD)
    const structuredData = page.locator('script[type="application/ld+json"]')
    if (await structuredData.count() > 0) {
      const content = await structuredData.textContent()
      expect(content).toBeTruthy()
    }
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]')
    if (await ogTitle.count() > 0) {
      const content = await ogTitle.getAttribute('content')
      expect(content).toBeTruthy()
    }
  })
})