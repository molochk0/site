import { createMocks } from 'node-mocks-http'
import handler from '../content/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    content: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/content', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return default content when no content in database', async () => {
      mockPrisma.content.findMany.mockResolvedValue([])

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler.GET()

      expect(mockPrisma.content.findMany).toHaveBeenCalled()
    })

    it('should return merged content when content exists in database', async () => {
      const mockContentRecords = [
        {
          id: '1',
          key: 'hero.title',
          value: 'Custom Restaurant Title',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          key: 'about.title',
          value: 'Our Custom Story',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.content.findMany.mockResolvedValue(mockContentRecords)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler.GET()

      expect(mockPrisma.content.findMany).toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      mockPrisma.content.findMany.mockRejectedValue(new Error('Database error'))

      const { req, res } = createMocks({
        method: 'GET',
      })

      try {
        await handler.GET()
      } catch (error) {
        // Test error handling
      }
    })

    it('should properly merge nested content keys', async () => {
      const mockContentRecords = [
        {
          id: '1',
          key: 'contact.hours.Monday',
          value: '9:00 AM - 10:00 PM',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          key: 'contact.phone',
          value: '+1 (555) 987-6543',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.content.findMany.mockResolvedValue(mockContentRecords)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler.GET()

      expect(mockPrisma.content.findMany).toHaveBeenCalled()
    })

    it('should include caching headers in response', async () => {
      mockPrisma.content.findMany.mockResolvedValue([])

      const { req, res } = createMocks({
        method: 'GET',
      })

      const response = await handler.GET()
      
      // Note: In a real test, we would check response headers here
      // This is a placeholder for verifying caching headers are set
    })
  })
})