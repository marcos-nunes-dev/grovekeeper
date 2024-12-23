import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn']
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

export const prisma = prismaClient