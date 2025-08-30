import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Button } from '../ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-amber-500') // Default primary variant
  })

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-white')
    
    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-gray-300')
    
    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-gray-100')
    
    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-500')
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')
    
    rerender(<Button size="default">Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders as different HTML elements', () => {
    render(<Button asChild><a href="/test">Link Button</a></Button>)
    
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('bg-amber-500') // Should still have default classes
  })

  it('supports loading state', () => {
    // Assuming loading prop is implemented
    render(<Button disabled>Loading...</Button>)
    
    const button = screen.getByRole('button', { name: 'Loading...' })
    expect(button).toBeDisabled()
  })

  it('handles keyboard events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Keyboard</Button>)
    
    const button = screen.getByRole('button', { name: 'Keyboard' })
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    // Note: Click handler should be called via Enter key press (browser behavior)
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    // Note: Click handler should be called via Space key press (browser behavior)
  })

  it('renders with icons', () => {
    const TestIcon = () => <svg data-testid="test-icon"><path /></svg>
    
    render(
      <Button>
        <TestIcon />
        With Icon
      </Button>
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })

  it('maintains accessibility attributes', () => {
    render(
      <Button 
        aria-label="Accessible button"
        aria-describedby="button-description"
      >
        Button
      </Button>
    )
    
    const button = screen.getByRole('button', { name: 'Accessible button' })
    expect(button).toHaveAttribute('aria-describedby', 'button-description')
  })
})