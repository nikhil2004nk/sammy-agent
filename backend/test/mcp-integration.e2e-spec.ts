import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@common';
import { McpModule } from '../src/modules/mcp/mcp.module';
import { ToolsModule } from '../src/modules/tools/tools.module';
import { ResolverModule } from '../src/modules/resolver/resolver.module';
import { RegistryModule } from '../src/modules/registry/registry.module';
import { EventsModule } from '../src/modules/events/events.module';
import { PermissionsModule } from '../src/modules/permissions/permissions.module';
import { ConfigModule } from '@nestjs/config';
import { ToolExecutorService } from '../src/modules/tools/tool-executor.service';
import { ExecutionContext } from '../src/common/execution-context';
import { ToolRegistryService } from '../src/modules/registry/tool-registry.service';
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
  let app: any; // INestApplication
  let executor: ToolExecutorService;
  let registry: ToolRegistryService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [testMcpConfig], isGlobal: true }),
        EventsModule,
        McpModule,
        RegistryModule,
        PermissionsModule,
        ResolverModule,
        ToolsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    executor = app.get(ToolExecutorService);
    registry = app.get(ToolRegistryService);
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
    traceId: 'e2e-trace',
    conversationId: 'conv-1',
    userId: 'user-1',
    agentId: 'agent-1',
    toolCalls: [],
    modelConfig: { provider: 'test', model: 'test' }
  };

  it('Scenario 1: Discover Mock tools -> Registry updated', () => {
    const tools = registry.getAllTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.find(t => t.name === 'calculator')).toBeDefined();
    expect(tools.find(t => t.name === 'echo')).toBeDefined();
    expect(tools.find(t => t.name === 'delay')).toBeDefined();
  });

  it('Scenario 2: Execute calculator -> Correct result', async () => {
    const result = await executor.executeTool(mockContext, 'mock.calculator', { a: 5, b: 3, operation: 'add' });
    expect(result.success).toBe(true);
    expect(result.data?.[0]?.text).toBe('8');
  });

  it('Scenario 3: Execute unknown tool -> Graceful failure', async () => {
    const result = await executor.executeTool(mockContext, 'mock.non_existent', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('is not available or unauthorized');
  });

  it('Scenario 4: Execute error -> Failed ToolExecutionResult', async () => {
    const result = await executor.executeTool(mockContext, 'mock.error', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('mocked deterministic error');
  });

  // Note: timeout handling relies on adapter timeout config which we haven't explicitly set up 
  // with a tight bound in this simple test, but we can verify delay works.
  it('Scenario 5: Execute delay -> Works', async () => {
    const startTime = Date.now();
    const result = await executor.executeTool(mockContext, 'mock.delay', { ms: 500 });
    const duration = Date.now() - startTime;
    expect(result.success).toBe(true);
    expect(duration).toBeGreaterThanOrEqual(490);
  });
});
