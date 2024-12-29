import { PrismaClient } from '@prisma/client'

// Create a separate instance for SSE connections
const prismaSSE = new PrismaClient({
  log: ['error'],
  datasourceUrl: process.env.DATABASE_URL
})

// Initialize the connection
prismaSSE.$connect()

// Handle cleanup on app shutdown
process.on('beforeExit', async () => {
  await prismaSSE.$disconnect()
})

export { prismaSSE } 