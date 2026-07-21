import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '../src/modules/mcp/mcp.module';
import { ToolsModule } from '../src/modules/tools/tools.module';
import { RegistryModule } from '../src/modules/registry/registry.module';
import { EventsModule } from '../src/modules/events/events.module';
import { PermissionsModule } from '../src/modules/permissions/permissions.module';
import { ToolCatalogService } from '../src/modules/registry/tool-catalog.service';
import { ToolExecutorService } from '../src/modules/tools/tool-executor.service';
import mcpConfig from '../src/modules/mcp/config/mcp.config';
import { ExecutionContext } from '../src/common/execution-context';
import { ConnectionContext } from '../src/modules/connections/types/connection.types';
import { ConnectionsModule } from '../src/modules/connections/connections.module';
import { DatabaseModule } from '../src/modules/database/database.module';
import * as path from 'path';

// Override the config for this test to point to the local mock server
const testMcpConfig = () => ({
  mcp: {
    servers: {
      mock: {
        command: 'node',
        args: [path.join(__dirname, 'mock-mcp-server/index.js')],
        transport: 'stdio',
      },
    },
  },
});

describe('MCP End-to-End Validation (e2e)', () => {
  let app: INestApplication;
  let toolCatalog: ToolCatalogService;
  let toolExecutor: ToolExecutorService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [testMcpConfig], isGlobal: true }),
        RegistryModule,
        EventsModule,
        PermissionsModule,
        McpModule,
        ToolsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    toolCatalog = app.get<ToolCatalogService>(ToolCatalogService);
    toolExecutor = app.get<ToolExecutorService>(ToolExecutorService);
    const mcpManager = app.get(require('../src/modules/mcp/manager/mcp-manager.service').McpManagerService);

    // Manually initialize the mock server since config overrides can be tricky in NestJS
    await mcpManager['initializeServer']('mock', {
      enabled: true,
      transport: 'stdio',
      command: 'node',
      args: [path.join(__dirname, 'mock-mcp-server/index.js')],
      retry: { maxAttempts: 1, backoffMs: 1000 }
    });

    // Wait for async discovery to finish
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await app.close();
  });

  const mockContext: ExecutionContext = {
    traceId: 'trace-1',
    conversationId: 'conv-1',
    runId: 'run-1',
    workspaceId: 'workspace-1',
    agentId: 'agent-1',
    modelConfig: { provider: 'mock', model: 'test', temperature: 0, maxTokens: 100 }
  };

  it('Scenario 1: Discover Mock tools -> Registry updated', () => {
    const tools = toolCatalog.getAllTools();
    expect(tools.length).toBeGreaterThanOrEqual(4);
    expect(tools.find(t => t.name === 'calculator')).toBeDefined();
    expect(tools.find(t => t.name === 'echo')).toBeDefined();
    expect(tools.find(t => t.name === 'delay')).toBeDefined();
    expect(tools.find(t => t.name === 'error')).toBeDefined();
  });

  it('Scenario 2: Execute calculator -> Correct result', async () => {
    const args = { operation: 'add', a: 10, b: 5 };
    const result = await toolExecutor.executeTool(mockContext, 'mock.calculator', args);
    expect(result.success).toBe(true);
    expect(result.data?.[0]?.text).toBe("15");
  });

  it('Scenario 3: Execute unknown tool -> Graceful failure', async () => {
    const result = await toolExecutor.executeTool(mockContext, 'mock.non_existent', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('is not available or unauthorized');
  });

  it('Scenario 4: Execute error -> Failed ToolExecutionResult', async () => {
    const args = { message: 'This is a mocked deterministic error.' };
    const result = await toolExecutor.executeTool(mockContext, 'mock.error', args);
    
    // The executor catches it and wraps it
    expect(result.success).toBe(false);
    expect(result.error).toContain('This is a mocked deterministic error');
  });

  it('Scenario 5: Execute delay -> Works', async () => {
    const args = { ms: 500 };
    const result = await toolExecutor.executeTool(mockContext, 'mock.delay', args);
    expect(result.success).toBe(true);
    expect(result.data?.[0]?.text).toBe('Delayed for 500ms');
  });
});
