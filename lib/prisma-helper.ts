import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 100 // 100ms

let isConnected = false

async function ensureConnection() {
  if (!isConnected) {
    try {
      await prisma.$connect()
      isConnected = true
    } catch (error) {
      console.error('Error connecting to Prisma:', error)
      throw error
    }
  }
}

export async function withPrisma<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  let retryCount = 0
  let lastError: Error | null = null

  while (retryCount < MAX_RETRIES) {
    try {
      await ensureConnection()
      const result = await operation(prisma)
      return result
    } catch (error) {
      lastError = error as Error
      console.error(`Prisma operation error (attempt ${retryCount + 1}):`, error)

      // Check for specific error conditions that warrant a retry
      if (
        error instanceof Error &&
        (error.message.includes('prepared statement') || 
         error.message.includes('Cannot read properties') ||
         error.message.includes('Connection pool timeout'))
      ) {
        // Calculate delay with exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
        await new Promise(resolve => setTimeout(resolve, delay))

        // Reset connection state and try to reconnect
        isConnected = false
        retryCount++
        continue
      }

      // If it's not a retryable error, throw immediately
      throw error
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Max retries exceeded')
}

// Cleanup on process exit
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    if (isConnected) {
      await prisma.$disconnect()
      isConnected = false
    }
  })
}
