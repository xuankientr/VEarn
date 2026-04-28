import { PrismaClient } from '@prisma/client';

// Prevent multiple Prisma Client instances in development
declare const globalThis: {
  prismaGlobal: PrismaClient | undefined;
} & typeof global;

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
