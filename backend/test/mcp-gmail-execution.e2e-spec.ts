import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from '../src/modules/events/events.module';
import { McpModule } from '../src/modules/mcp/mcp.module';
import { RegistryModule } from '../src/modules/registry/registry.module';
import { PermissionsModule } from '../src/modules/permissions/permissions.module';
import { ToolsModule } from '../src/modules/tools/tools.module';
import { ToolExecutorService } from '../src/modules/tools/tool-executor.service';
import { ToolCatalogService } from '../src/modules/registry/tool-catalog.service';
import { ExecutionContext } from '../src/common/execution-context';
import * as path from 'path';

// Override the config for this test to point to the local standalone Gmail MCP Server
const testMcpConfig = () => ({
  mcp: {
    servers: {
      gmail_real: {
        command: 'node',
        args: [path.join(__dirname, '../../gmail-mcp-server/dist/index.js')],
        transport: 'stdio',
        env: {
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
          GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || '',
        }
      },
    },
  },
});

const shouldRun = process.env.RUN_GMAIL_TESTS === 'true';

(shouldRun ? describe : describe.skip)('Real Gmail MCP Execution (e2e)', () => {
  let app: INestApplication;
  let toolCatalog: ToolCatalogService;
  let toolExecutor: ToolExecutorService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [testMcpConfig], isGlobal: true }),
        EventsModule,
        McpModule,
        RegistryModule,
        PermissionsModule,
        ToolsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    toolCatalog = app.get<ToolCatalogService>(ToolCatalogService);
    toolExecutor = app.get<ToolExecutorService>(ToolExecutorService);

    // Wait for discovery to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  const mockContext: ExecutionContext = {
    agentId: 'agent-1',
    conversationId: 'conv-1',
    traceId: 'trace-1',
    runId: 'run-1',
    workspaceId: 'workspace-1',
    modelConfig: { provider: 'mock', model: 'mock', temperature: 0, maxTokens: 100 },
    metadata: {}
  };

  it('should list messages successfully', async () => {
    const result = await toolExecutor.executeTool(mockContext, 'gmail_real.gmail.list_messages', { maxResults: 2 });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    const parsed = JSON.parse(result.data?.[0]?.text || '{}');
    expect(parsed).toHaveProperty('messages');
  });

  it('should create a draft safely', async () => {
    const result = await toolExecutor.executeTool(mockContext, 'gmail_real.gmail.create_draft', {
      to: 'test@example.com',
      subject: 'Hello from Jarvis Tests',
      body: 'This is an automated test draft.'
    });
    
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.data?.[0]?.text || '{}');
    expect(parsed).toHaveProperty('id'); // Draft ID
  });

  it('should return standardized failure on invalid tool', async () => {
    const result = await toolExecutor.executeTool(mockContext, 'gmail_real.gmail.invalid_tool', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('is not available or unauthorized');
  });
});
