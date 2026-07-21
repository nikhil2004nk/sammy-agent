const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const conversationId = 'e3ddefaf-3e17-4834-86dc-dd43d0eb0ddd';
  const runs = await prisma.run.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(runs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
