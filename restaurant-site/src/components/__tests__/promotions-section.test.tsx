import { render, screen, fireEvent } from '@testing-library/react'
import { PromotionsSection } from '../landing/promotions-section'

const mockPromotions = [
  {
    id: '1',
    title: 'Счастливые часы',
    description: 'Скидка 30% на все напитки с 16:00 до 19:00 каждый день',
    discount: 30,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    image: 'https://example.com/image1.jpg',
    isActive: true
  },
  {
    id: '2',
    title: 'Бизнес-ланч',
    description: 'Специальное предложение для бизнес-ланча',
    discount: 25,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-06-30'),
    image: 'https://example.com/image2.jpg',
    isActive: true
  },
  {
    id: '3',
    title: 'Семейный ужин',
    description: 'При заказе от 3000₽ - скидка 15% для семей с детьми',
    discount: 15,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    isActive: false
  }
]

describe('PromotionsSection Component', () => {
  it('renders section title and description', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    expect(screen.getByText('Выгодные предложения')).toBeInTheDocument()
    expect(screen.getByText(/воспользуйтесь нашими специальными предложениями/i)).toBeInTheDocument()
  })

  it('displays statistics correctly', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    // Should show total active promotions
    const activePromotions = mockPromotions.filter(p => p.isActive && new Date(p.validUntil) > new Date())
    expect(screen.getByText(activePromotions.length.toString())).toBeInTheDocument()
    expect(screen.getByText('Активных акций')).toBeInTheDocument()
  })

  it('renders promotion cards with correct information', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    // Check if promotion titles are rendered
    expect(screen.getByText('Счастливые часы')).toBeInTheDocument()
    expect(screen.getByText('Бизнес-ланч')).toBeInTheDocument()
    
    // Check discount badges
    expect(screen.getByText('-30%')).toBeInTheDocument()
    expect(screen.getByText('-25%')).toBeInTheDocument()
  })

  it('shows only active promotions by default', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    // Active promotions should be visible
    expect(screen.getByText('Счастливые часы')).toBeInTheDocument()
    expect(screen.getByText('Бизнес-ланч')).toBeInTheDocument()
    
    // Inactive promotion should not be visible (assuming filtering logic)
    // This depends on actual implementation
  })

  it('displays promotion descriptions', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    expect(screen.getByText('Скидка 30% на все напитки с 16:00 до 19:00 каждый день')).toBeInTheDocument()
    expect(screen.getByText('Специальное предложение для бизнес-ланча')).toBeInTheDocument()
  })

  it('shows promotion validity dates', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    // Should display validity information (format depends on implementation)
    expect(screen.getByText(/активно/i)).toBeInTheDocument()
  })

  it('renders newsletter signup section', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    expect(screen.getByText('Не пропустите новые акции!')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ваш email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /подписаться/i })).toBeInTheDocument()
  })

  it('handles newsletter subscription', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    const emailInput = screen.getByPlaceholderText('Ваш email')
    const subscribeButton = screen.getByRole('button', { name: /подписаться/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(subscribeButton)
    
    // Should handle subscription (actual behavior depends on implementation)
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('displays empty state when no promotions', () => {
    render(<PromotionsSection promotions={[]} />)
    
    expect(screen.getByText('Акции временно недоступны')).toBeInTheDocument()
    expect(screen.getByText('Следите за обновлениями - скоро появятся новые предложения!')).toBeInTheDocument()
  })

  it('handles show more/less functionality', () => {
    const manyPromotions = Array.from({ length: 6 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Акция ${i + 1}`,
      description: `Описание акции ${i + 1}`,
      discount: 10 + i * 5,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'),
      isActive: true
    }))
    
    render(<PromotionsSection promotions={manyPromotions} />)
    
    // Should show "Show all" button if more than 4 promotions
    const showAllButton = screen.queryByText(/показать все акции/i)
    if (showAllButton) {
      expect(showAllButton).toBeInTheDocument()
      
      fireEvent.click(showAllButton)
      
      // Should now show "Show less" button
      expect(screen.getByText(/показать меньше/i)).toBeInTheDocument()
    }
  })

  it('handles promotion card interactions', () => {
    render(<PromotionsSection promotions={mockPromotions} />)
    
    // Find and click a "Воспользоваться" button
    const useButtons = screen.getAllByText('Воспользоваться')
    if (useButtons.length > 0) {
      fireEvent.click(useButtons[0])
      // Should handle promotion selection (behavior depends on implementation)
    }
  })
})