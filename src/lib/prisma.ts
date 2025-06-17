import { PrismaClient } from '@prisma/client/edge';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Handle database connection errors
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    console.error('Prisma error:', error);
    // Add any custom error handling here
    throw error;
  }
});

export default prisma;
