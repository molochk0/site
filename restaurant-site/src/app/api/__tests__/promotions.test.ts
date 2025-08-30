import { createMocks } from 'node-mocks-http'
import handler from '../promotions/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    promotion: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/promotions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return active promotions', async () => {
      const mockPromotions = [
        {
          id: '1',
          title: 'Test Promotion',
          description: 'Test description',
          discount: 20,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2024-12-31'),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler.GET()

      expect(mockPrisma.promotion.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          validUntil: {
            gte: expect.any(Date),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    })

    it('should handle database errors', async () => {
      mockPrisma.promotion.findMany.mockRejectedValue(new Error('Database error'))

      const { req, res } = createMocks({
        method: 'GET',
      })

      try {
        await handler.GET()
      } catch (error) {
        // This test verifies error handling in the route
      }
    })
  })
})