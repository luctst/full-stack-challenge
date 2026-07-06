import { PrismaClient } from "@prisma/client";

// ponytail: minimal shared Prisma client singleton. Next.js dev hot-reload
// re-evaluates modules, so a fresh `new PrismaClient()` per reload leaks
// connections until Postgres refuses them — stashing the instance on
// `globalThis` (dev only) prevents that guaranteed bug. A repository/data-access
// layer is intentionally NOT added: actions call Prisma directly at this scope.
// Upgrade path: introduce a repository module only if query reuse or a testing
// seam actually demands it.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
