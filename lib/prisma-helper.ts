import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 100 // 100ms

export async function withPrisma<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  let retryCount = 0
  let lastError: Error | null = null

  while (retryCount < MAX_RETRIES) {
    try {
      // Ensure connection before operation
      await prisma.$connect()
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

        // Disconnect and wait before retrying
        try {
          await prisma.$disconnect()
        } catch (disconnectError) {
          console.error('Error during disconnect:', disconnectError)
        }

        retryCount++
        continue
      }

      // If it's not a retryable error, throw immediately
      throw error
    } finally {
      // Always try to clean up the connection
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Error disconnecting from Prisma:', disconnectError)
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Max retries exceeded')
}
