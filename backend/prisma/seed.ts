import { PrismaClient, AgentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB Seed...');

  // 1. Create Base Capabilities
  const capabilities = [
    { key: 'chat', name: 'Chat', description: 'Basic conversational capabilities' },
    { key: 'analysis', name: 'Analysis', description: 'Analyze preconditions and requirements' },
    { key: 'verification', name: 'Verification', description: 'Verify outputs, security, or syntax' },
    { key: 'execution', name: 'Execution', description: 'Execute synthesis and final actions' },
    { key: 'search', name: 'Search', description: 'Search the web or knowledge bases' }
  ];

  for (const cap of capabilities) {
    await prisma.capability.upsert({
      where: { key: cap.key },
      update: {},
      create: {
        key: cap.key,
        name: cap.name,
        description: cap.description
      }
    });
  }
  console.log('Seeded Capabilities.');

  // 2. Create Core Agent (assume null workspaceId for a global agent)
  // Since Prisma unique constraint is [workspaceId, key], and workspaceId is nullable, 
  // we can't easily upsert with a null workspaceId if it's part of the unique key in some versions of Prisma.
  // We'll use findFirst and then create/update.
  let coreAgent = await prisma.agent.findFirst({
    where: { key: 'sammy-core' }
  });
  
  if (!coreAgent) {
    coreAgent = await prisma.agent.create({
      data: {
        key: 'sammy-core',
        name: 'Sammy Core Agent',
        description: 'The core agent capable of standard interactions.',
        version: '1.0.0',
        status: AgentStatus.ACTIVE
      }
    });
  }

  // 3. Link Capabilities to Core Agent
  const allCaps = await prisma.capability.findMany();
  for (const cap of allCaps) {
    const existingLink = await prisma.agentCapability.findFirst({
      where: {
        agentId: coreAgent.id,
        capabilityId: cap.id
      }
    });

    if (!existingLink) {
      await prisma.agentCapability.create({
        data: {
          agentId: coreAgent.id,
          capabilityId: cap.id,
          status: AgentStatus.ACTIVE
        }
      });
    }
  }
  console.log('Seeded Sammy Core Agent with all capabilities.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
