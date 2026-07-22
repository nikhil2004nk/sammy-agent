const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.workspace.findFirst().then(w => {
  console.log(w);
  return prisma.$disconnect();
});
