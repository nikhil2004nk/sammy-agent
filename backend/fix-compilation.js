const fs = require('fs');
const path = require('path');

const replaceInFile = (file, replacements) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { search, replace } of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content);
};

// Connections tests
replaceInFile('src/modules/connections/factories/connection.factory.spec.ts', [
  { search: 'tenantId: \'t1\',', replace: 'workspaceId: \'t1\',' },
  { search: 'userId: \'u1\',', replace: '' }
]);

replaceInFile('src/modules/connections/providers/oauth-connection.provider.spec.ts', [
  { search: 'tenantId: \'t1\',', replace: 'workspaceId: \'t1\',' },
  { search: 'userId: \'u1\',', replace: '' }
]);

// Tools
replaceInFile('src/modules/tools/tool-executor.service.ts', [
  { search: 'tenantId: context.tenantId || \'default\',', replace: 'workspaceId: context.workspaceId || \'default\',' },
  { search: 'userId: context.userId,', replace: '' }
]);

replaceInFile('src/modules/tools/tool-executor.service.spec.ts', [
  { search: 'modelConfig: { provider: \'test\', model: \'test\' }', replace: 'modelConfig: { provider: \'test\', model: \'test\', temperature: 0.7, maxTokens: 2000 }' }
]);

// Conversation
replaceInFile('src/modules/conversation/conversation.controller.ts', [
  { search: 'userId: \'test-user-id\',', replace: 'workspaceId: \'test-workspace-id\',' }
]);

replaceInFile('src/modules/conversation/conversation.service.ts', [
  { search: 'userId: \'\', // Placeholder until auth is implemented', replace: '' },
  { search: 'userId: \'test-user-id\', // Hardcoded until auth', replace: '' }
]);

replaceInFile('src/modules/conversation/repositories/prisma/prisma-conversation.repository.ts', [
  { search: 'tenantId: data.tenantId,', replace: 'workspaceId: data.workspaceId,' }
]);

// Tests
replaceInFile('test/agent-loop.e2e-spec.ts', [
  { search: 'userId: \'test-user\',', replace: 'workspaceId: \'test-workspace\',' },
  { search: 'let conversation: Promise<Conversation>;', replace: 'let conversationId: string;' },
  { search: 'conversation.id', replace: 'conversationId' },
  { search: 'conversation.length', replace: 'messages.length' }
]);

replaceInFile('test/mcp-gmail-execution.e2e-spec.ts', [
  { search: 'userId: \'test-user\',', replace: 'workspaceId: \'test-workspace\',' }
]);

replaceInFile('test/mcp-integration.e2e-spec.ts', [
  { search: 'userId: \'test-user\',', replace: 'workspaceId: \'test-workspace\',' }
]);

console.log('Fixed compilation errors');
