import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

export async function withPrisma<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    // Ensure connection before operation
    await prisma.$connect()
    const result = await operation(prisma)
    return result
  } catch (error) {
    console.error('Prisma operation error:', error)
    if (
      error instanceof Error &&
      (error.message.includes('prepared statement') || error.message.includes('Cannot read properties'))
    ) {
      // If we hit connection issues, wait a bit and retry once
      await new Promise(resolve => setTimeout(resolve, 100))
      try {
        // Disconnect and reconnect before retrying
        await prisma.$disconnect()
        await prisma.$connect()
        return await operation(prisma)
      } catch (retryError) {
        console.error('Failed to retry operation:', retryError)
        throw retryError
      }
    }
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
