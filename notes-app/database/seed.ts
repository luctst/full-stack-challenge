import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Categories-only seed (no to-dos), per PLAN.md Task 2.
const categories = ["Work", "Family", "Personal"];

async function main() {
  // ponytail: upsert on the unique `name` so re-running the seed is idempotent —
  // no need to truncate first. Upgrade path: swap to createMany if the set grows.
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
