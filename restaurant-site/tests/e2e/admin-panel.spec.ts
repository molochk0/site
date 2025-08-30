import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/admin/login')
  })

  test('should display admin login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Админ панель|Admin|Вход/)
    
    // Check login form elements
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"], input[type="submit"]')).toBeVisible()
  })

  test('should handle login form validation', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first()
    
    // Try submitting empty form
    await submitButton.click()
    
    // Should show validation errors or stay on login page
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/login/)
  })

  test('should redirect unauthorized access to login', async ({ page }) => {
    // Try accessing admin dashboard directly
    await page.goto('/admin')
    
    // Should redirect to login or show login form
    await page.waitForURL(/login/)
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
  })

  test('should handle invalid login credentials', async ({ page }) => {
    // Fill invalid credentials
    await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com')
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword')
    
    // Submit form
    await page.click('button[type="submit"], input[type="submit"]')
    
    // Should show error message or stay on login page
    await page.waitForTimeout(2000)
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/login/)
  })

  // Skip authenticated tests since we don't have valid credentials in testing
  test.skip('should access admin dashboard with valid credentials', async ({ page }) => {
    // This test would require valid test credentials
    // Fill valid credentials
    await page.fill('input[type="email"]', 'admin@restaurant.com')
    await page.fill('input[type="password"]', 'validpassword')
    
    await page.click('button[type="submit"]')
    
    // Should redirect to admin dashboard
    await page.waitForURL('/admin')
    await expect(page.locator('h1, [data-testid="dashboard-title"]')).toContainText('Панель управления')
  })

  test.skip('should display admin navigation and sections', async ({ page }) => {
    // Assuming successful login
    await page.goto('/admin')
    
    // Check sidebar navigation
    await expect(page.locator('nav')).toBeVisible()
    
    // Check for main admin sections
    const sidebarLinks = [
      'Акции',
      'События', 
      'Контент',
      'Пользователи'
    ]
    
    for (const linkText of sidebarLinks) {
      const link = page.locator(`nav a:has-text("${linkText}")`)
      if (await link.count() > 0) {
        await expect(link).toBeVisible()
      }
    }
  })

  test.skip('should handle promotions management', async ({ page }) => {
    await page.goto('/admin/promotions')
    
    // Check promotions table/list
    await expect(page.locator('table, [data-testid="promotions-list"]')).toBeVisible()
    
    // Check add promotion button
    const addButton = page.locator('button:has-text("Добавить"), [data-testid="add-promotion"]')
    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible()
      
      // Click add button
      await addButton.click()
      
      // Check if modal or form appears
      await expect(page.locator('form, [data-testid="promotion-form"]')).toBeVisible()
    }
  })

  test.skip('should handle events management', async ({ page }) => {
    await page.goto('/admin/events')
    
    // Check events table/list
    await expect(page.locator('table, [data-testid="events-list"]')).toBeVisible()
    
    // Check add event functionality
    const addButton = page.locator('button:has-text("Добавить"), [data-testid="add-event"]')
    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible()
    }
  })

  test('should be responsive on mobile devices', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check mobile-friendly login form
      const emailInput = page.locator('input[type="email"]').first()
      const passwordInput = page.locator('input[type="password"]').first()
      
      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
      
      // Check that inputs are properly sized for mobile
      const emailBox = await emailInput.boundingBox()
      const passwordBox = await passwordInput.boundingBox()
      
      if (emailBox) expect(emailBox.width).toBeGreaterThan(200)
      if (passwordBox) expect(passwordBox.width).toBeGreaterThan(200)
    }
  })

  test('should handle admin panel accessibility', async ({ page }) => {
    // Check form labels
    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    
    // Check for proper labeling
    const emailId = await emailInput.getAttribute('id')
    const passwordId = await passwordInput.getAttribute('id')
    
    if (emailId) {
      const emailLabel = page.locator(`label[for="${emailId}"]`)
      if (await emailLabel.count() > 0) {
        await expect(emailLabel).toBeVisible()
      }
    }
    
    if (passwordId) {
      const passwordLabel = page.locator(`label[for="${passwordId}"]`)
      if (await passwordLabel.count() > 0) {
        await expect(passwordLabel).toBeVisible()
      }
    }
    
    // Check for proper focus management
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})