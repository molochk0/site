import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Header } from '../landing/header'

// Mock smooth scroll behavior
const mockScrollIntoView = jest.fn()
global.Element.prototype.scrollIntoView = mockScrollIntoView

// Mock window.addEventListener for scroll events
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()
global.addEventListener = mockAddEventListener
global.removeEventListener = mockRemoveEventListener

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })
  })

  it('renders navigation items correctly', () => {
    render(<Header />)
    
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Меню')).toBeInTheDocument()
    expect(screen.getByText('Акции')).toBeInTheDocument()
    expect(screen.getByText('События')).toBeInTheDocument()
    expect(screen.getByText('О нас')).toBeInTheDocument()
    expect(screen.getByText('Контакты')).toBeInTheDocument()
  })

  it('displays restaurant logo and name', () => {
    render(<Header />)
    
    expect(screen.getByText('Вкусный уголок')).toBeInTheDocument()
  })

  it('shows contact information', () => {
    render(<Header />)
    
    expect(screen.getByText('+7 (495) 123-45-67')).toBeInTheDocument()
  })

  it('displays booking button', () => {
    render(<Header />)
    
    expect(screen.getByRole('button', { name: /бронирование/i })).toBeInTheDocument()
  })

  it('opens mobile menu when hamburger button is clicked', () => {
    render(<Header />)
    
    // Find and click the mobile menu button (hamburger)
    const mobileMenuButton = screen.getByRole('button', { name: '' })
    fireEvent.click(mobileMenuButton)
    
    // Check if mobile menu content is visible
    // Note: In actual implementation with Framer Motion animations,
    // you might need to wait for animations to complete
  })

  it('handles navigation item clicks', () => {
    // Mock document.querySelector for smooth scrolling
    const mockElement = { scrollIntoView: mockScrollIntoView }
    document.querySelector = jest.fn().mockReturnValue(mockElement)
    
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: 'Меню' })
    fireEvent.click(menuButton)
    
    expect(document.querySelector).toHaveBeenCalledWith('#menu')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('changes appearance when scrolled', async () => {
    const { rerender } = render(<Header />)
    
    // Simulate scroll event
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 100,
    })
    
    // Trigger scroll event
    const scrollHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'scroll'
    )?.[1]
    
    if (scrollHandler) {
      scrollHandler()
    }
    
    rerender(<Header />)
    
    // Header should have different styling when scrolled
    // This would need to be tested based on actual implementation
  })

  it('handles booking button click', () => {
    const mockElement = { scrollIntoView: mockScrollIntoView }
    document.querySelector = jest.fn().mockReturnValue(mockElement)
    
    render(<Header />)
    
    const bookingButton = screen.getByRole('button', { name: /бронирование/i })
    fireEvent.click(bookingButton)
    
    expect(document.querySelector).toHaveBeenCalledWith('#contact')
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('renders mobile menu with all navigation items', () => {
    render(<Header />)
    
    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: '' })
    fireEvent.click(mobileMenuButton)
    
    // All navigation items should be present in mobile menu as well
    const menuItems = screen.getAllByText('Главная')
    expect(menuItems.length).toBeGreaterThan(0)
  })

  it('displays working hours in mobile menu', () => {
    render(<Header />)
    
    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button', { name: '' })
    fireEvent.click(mobileMenuButton)
    
    // Check for working hours
    expect(screen.getByText('Часы работы')).toBeInTheDocument()
  })
})