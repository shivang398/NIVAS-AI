import { vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure the mock instance is created before imports and vi.mock
const { prismaMock } = await vi.hoisted(async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return { prismaMock: mockDeep() };
});

// Mock both config files that export the Prisma client
vi.mock('../config/prisma.js', () => {
  return { default: prismaMock };
});

vi.mock('../config/db.js', () => {
  return { prisma: prismaMock };
});

// Since lease.controller creates its own instance, we mock the @prisma/client module globally
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      constructor() {
        return prismaMock;
      }
    }
  };
});

beforeEach(async () => {
  const { mockReset } = await import('vitest-mock-extended');
  mockReset(prismaMock);
});

export { prismaMock };
