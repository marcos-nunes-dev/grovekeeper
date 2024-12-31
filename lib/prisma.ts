import { PrismaClient } from '@prisma/client'

// Use interface instead of var for global augmentation
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({
  log: ['error'],
  datasourceUrl: process.env.DATABASE_URL
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma }