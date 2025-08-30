import { createMocks } from 'node-mocks-http'
import handler from '../events/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return published upcoming events', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Test Event',
          description: 'Test event description',
          date: new Date('2024-06-01T19:00:00Z'),
          time: '19:00',
          capacity: 50,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.event.findMany.mockResolvedValue(mockEvents)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler.GET()

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: {
          isPublished: true,
          date: {
            gte: expect.any(Date),
          },
        },
        orderBy: {
          date: 'asc',
        },
      })
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.event.findMany.mockRejectedValue(new Error('Database connection failed'))

      const { req, res } = createMocks({
        method: 'GET',
      })

      try {
        await handler.GET()
      } catch (error) {
        // Test error handling
      }
    })

    it('should filter out past events', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Future Event',
          description: 'Future event description',
          date: new Date('2025-06-01T19:00:00Z'),
          time: '19:00',
          capacity: 50,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.event.findMany.mockResolvedValue(mockEvents)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler.GET()

      // Verify that the date filter is applied correctly
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: expect.any(Date),
            },
          }),
        })
      )
    })
  })
})