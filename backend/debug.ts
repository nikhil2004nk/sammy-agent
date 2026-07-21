import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const msgs = await prisma.message.findMany({
    include: { parts: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.dir(msgs, { depth: null });
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
