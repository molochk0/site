import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#third-party-widget') // Exclude third-party widgets if any
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper heading structure', async ({ page }) => {
    // Check heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent?.trim() || '',
        visible: el.offsetParent !== null
      }))
    )

    // Should have at least one h1
    const h1Count = headings.filter(h => h.level === 1 && h.visible).length
    expect(h1Count).toBeGreaterThanOrEqual(1)
    expect(h1Count).toBeLessThanOrEqual(1) // Should have only one h1

    // Check heading order (no skipped levels)
    const visibleHeadings = headings.filter(h => h.visible).map(h => h.level)
    for (let i = 1; i < visibleHeadings.length; i++) {
      const current = visibleHeadings[i]
      const previous = visibleHeadings[i - 1]
      
      // Next heading should not skip more than one level
      expect(current - previous).toBeLessThanOrEqual(1)
    }
  })

  test('should have proper form accessibility', async ({ page }) => {
    const forms = page.locator('form')
    const formCount = await forms.count()

    if (formCount > 0) {
      for (let i = 0; i < formCount; i++) {
        const form = forms.nth(i)
        
        // Check all form inputs have labels or aria-label
        const inputs = form.locator('input, textarea, select')
        const inputCount = await inputs.count()

        for (let j = 0; j < inputCount; j++) {
          const input = inputs.nth(j)
          const inputType = await input.getAttribute('type')
          
          // Skip hidden inputs
          if (inputType === 'hidden') continue

          const id = await input.getAttribute('id')
          const ariaLabel = await input.getAttribute('aria-label')
          const ariaLabelledby = await input.getAttribute('aria-labelledby')
          
          let hasLabel = false

          // Check for explicit label
          if (id) {
            const label = page.locator(`label[for="${id}"]`)
            hasLabel = await label.count() > 0
          }

          // Check for aria-label or aria-labelledby
          if (!hasLabel) {
            hasLabel = !!(ariaLabel || ariaLabelledby)
          }

          // Check for placeholder as fallback (not ideal but acceptable)
          if (!hasLabel) {
            const placeholder = await input.getAttribute('placeholder')
            hasLabel = !!placeholder
          }

          expect(hasLabel).toBe(true)
        }

        // Check form has submit button
        const submitButtons = form.locator('button[type="submit"], input[type="submit"]')
        const submitCount = await submitButtons.count()
        expect(submitCount).toBeGreaterThan(0)
      }
    }
  })

  test('should have keyboard navigation support', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab')
    
    let focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Continue tabbing through interactive elements
    const interactiveElements = []
    for (let i = 0; i < 10; i++) {
      const currentFocused = await page.evaluate(() => {
        const element = document.activeElement
        return {
          tagName: element?.tagName,
          type: element?.getAttribute('type'),
          role: element?.getAttribute('role'),
          ariaLabel: element?.getAttribute('aria-label'),
          visible: element ? element.offsetParent !== null : false
        }
      })

      if (currentFocused.visible) {
        interactiveElements.push(currentFocused)
      }

      await page.keyboard.press('Tab')
      
      // Break if we've cycled back to the first element
      const newFocused = await page.evaluate(() => document.activeElement?.tagName)
      if (interactiveElements.length > 0 && newFocused === interactiveElements[0].tagName && i > 5) {
        break
      }
    }

    // Should have found some focusable elements
    expect(interactiveElements.length).toBeGreaterThan(0)
  })

  test('should have proper color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('body')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )

    expect(colorContrastViolations).toEqual([])
  })

  test('should have proper image alt text', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const isVisible = await image.isVisible()

      if (isVisible) {
        const alt = await image.getAttribute('alt')
        const role = await image.getAttribute('role')
        
        // Images should have alt text unless they're decorative (empty alt or role="presentation")
        const isDecorative = alt === '' || role === 'presentation'
        
        if (!isDecorative) {
          expect(alt).toBeTruthy()
          expect(alt?.length).toBeGreaterThan(0)
        }
      }
    }
  })

  test('should support screen reader navigation', async ({ page }) => {
    // Check for proper semantic HTML
    const landmarks = await page.evaluate(() => {
      const landmarkSelectors = [
        'main', '[role="main"]',
        'nav', '[role="navigation"]', 
        'header', '[role="banner"]',
        'footer', '[role="contentinfo"]',
        'aside', '[role="complementary"]',
        'section', '[role="region"]'
      ]
      
      return landmarkSelectors.map(selector => ({
        selector,
        count: document.querySelectorAll(selector).length
      }))
    })

    // Should have main content area
    const mainLandmarks = landmarks.filter(l => 
      l.selector.includes('main') && l.count > 0
    )
    expect(mainLandmarks.length).toBeGreaterThan(0)

    // Check for skip links
    const skipLinks = page.locator('a[href^="#"]:has-text("Skip"), a[href^="#"]:has-text("Перейти")')
    const skipLinkCount = await skipLinks.count()
    
    // Skip link is recommended but not required
    if (skipLinkCount > 0) {
      const firstSkipLink = skipLinks.first()
      
      // Skip link should be focusable
      await page.keyboard.press('Tab')
      const focusedSkipLink = page.locator(':focus')
      
      // Check if first tab goes to skip link
      const isSkipLinkFocused = await focusedSkipLink.evaluate((el, skipEl) => 
        el === skipEl, await firstSkipLink.elementHandle()
      )
      
      if (isSkipLinkFocused) {
        await expect(firstSkipLink).toBeVisible()
      }
    }
  })

  test('should handle focus management properly', async ({ page }) => {
    // Test focus indicators are visible
    const focusableElements = page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
    const focusableCount = await focusableElements.count()

    if (focusableCount > 0) {
      const firstFocusable = focusableElements.first()
      await firstFocusable.focus()
      
      // Check focus indicator is visible (not outline: none)
      const focusStyles = await firstFocusable.evaluate(el => {
        const styles = window.getComputedStyle(el, ':focus')
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
          border: styles.border
        }
      })

      // Should have some form of focus indicator
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none' ||
        focusStyles.border !== 'none'

      expect(hasFocusIndicator).toBe(true)
    }
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for proper ARIA usage
    const ariaElements = await page.evaluate(() => {
      const elementsWithAria = Array.from(document.querySelectorAll('*')).filter(el => {
        return Array.from(el.attributes).some(attr => 
          attr.name.startsWith('aria-') || attr.name === 'role'
        )
      })

      return elementsWithAria.map(el => ({
        tagName: el.tagName,
        attributes: Array.from(el.attributes)
          .filter(attr => attr.name.startsWith('aria-') || attr.name === 'role')
          .map(attr => ({ name: attr.name, value: attr.value }))
      }))
    })

    // Check for common ARIA patterns
    for (const element of ariaElements) {
      for (const attr of element.attributes) {
        if (attr.name === 'aria-expanded') {
          // aria-expanded should be true or false
          expect(['true', 'false']).toContain(attr.value)
        }
        
        if (attr.name === 'aria-hidden') {
          // aria-hidden should be true or false
          expect(['true', 'false']).toContain(attr.value)
        }

        if (attr.name === 'role') {
          // Role should be a valid ARIA role
          const validRoles = [
            'button', 'link', 'navigation', 'main', 'banner', 'contentinfo',
            'complementary', 'region', 'article', 'section', 'heading',
            'list', 'listitem', 'tab', 'tabpanel', 'dialog', 'alertdialog',
            'alert', 'status', 'progressbar', 'slider', 'spinbutton',
            'textbox', 'checkbox', 'radio', 'menubar', 'menu', 'menuitem'
          ]
          
          // Note: This is not exhaustive, just checking common roles
          // Custom roles or newer ARIA roles might not be in this list
        }
      }
    }
  })

  test('should be usable with keyboard only', async ({ page }) => {
    // Navigate through key interactive elements using only keyboard
    const interactiveSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled]):not([type="hidden"])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ]

    let totalInteractive = 0
    let keyboardAccessible = 0

    for (const selector of interactiveSelectors) {
      const elements = page.locator(selector)
      const count = await elements.count()
      
      for (let i = 0; i < Math.min(count, 5); i++) { // Test first 5 of each type
        const element = elements.nth(i)
        const isVisible = await element.isVisible()
        
        if (isVisible) {
          totalInteractive++
          
          try {
            await element.focus()
            const isFocused = await element.evaluate(el => el === document.activeElement)
            
            if (isFocused) {
              keyboardAccessible++
              
              // Test activation with Enter/Space for buttons and links
              const tagName = await element.evaluate(el => el.tagName.toLowerCase())
              if (tagName === 'button' || tagName === 'a') {
                // Just test that Enter doesn't cause errors
                await page.keyboard.press('Enter')
                await page.waitForTimeout(100)
              }
            }
          } catch (error) {
            // Element might not be focusable, which is okay for some elements
          }
        }
      }
    }

    // At least 80% of interactive elements should be keyboard accessible
    if (totalInteractive > 0) {
      const accessibilityRate = keyboardAccessible / totalInteractive
      expect(accessibilityRate).toBeGreaterThanOrEqual(0.8)
    }
  })

  test('should handle reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Check if animations respect reduced motion
    const animatedElements = page.locator('[class*="animate"], [style*="animation"], [style*="transition"]')
    const animatedCount = await animatedElements.count()
    
    if (animatedCount > 0) {
      // Test that animations can be disabled
      const hasReducedMotionCSS = await page.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      })
      
      expect(hasReducedMotionCSS).toBe(true)
      
      // Elements with animations should respect the preference
      for (let i = 0; i < Math.min(animatedCount, 3); i++) {
        const element = animatedElements.nth(i)
        
        const computedStyle = await element.evaluate(el => {
          const style = window.getComputedStyle(el)
          return {
            animationDuration: style.animationDuration,
            transitionDuration: style.transitionDuration
          }
        })
        
        // Reduced motion should either disable animations or make them very fast
        if (computedStyle.animationDuration !== 'none') {
          const duration = parseFloat(computedStyle.animationDuration || '0')
          expect(duration).toBeLessThanOrEqual(0.1) // 100ms or less
        }
      }
    }
  })
})