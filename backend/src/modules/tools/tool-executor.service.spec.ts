import { Test, TestingModule } from '@nestjs/testing';
import { ToolExecutorService } from './tool-executor.service';
import { ToolDiscoveryService } from '../registry/tool-discovery.service';
import { McpManagerService } from '../mcp/manager/mcp-manager.service';
import { EventBusService } from '../events/event-bus.service';
import { ExecutionContext } from '../../common/execution-context';
import { ToolMetadata } from '../mcp/types/mcp.types';
import { ConnectionFactory } from '../connections/factories/connection.factory';

describe('ToolExecutorService', () => {
  let service: ToolExecutorService;
  let discovery: ToolDiscoveryService;
  let mcpManager: McpManagerService;
  let eventBus: EventBusService;
  let connectionFactory: ConnectionFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolExecutorService,
        {
          provide: ToolDiscoveryService,
          useValue: { resolveTool: jest.fn() },
        },
        {
          provide: McpManagerService,
          useValue: { getAdapter: jest.fn() },
        },
        {
          provide: EventBusService,
          useValue: {
            emitToolExecutionStarted: jest.fn(),
            emitToolExecutionCompleted: jest.fn(),
            emitToolExecutionFailed: jest.fn(),
          },
        },
        {
          provide: ConnectionFactory,
          useValue: { resolveConnection: jest.fn() },
        }
      ],
    }).compile();

    service = module.get<ToolExecutorService>(ToolExecutorService);
    discovery = module.get<ToolDiscoveryService>(ToolDiscoveryService);
    mcpManager = module.get<McpManagerService>(McpManagerService);
    eventBus = module.get<EventBusService>(EventBusService);
    connectionFactory = module.get<ConnectionFactory>(ConnectionFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockContext: ExecutionContext = {
    traceId: 'trace-1',
    conversationId: 'conv-1',
    runId: 'run-1',
    workspaceId: 'workspace-1',
    agentId: 'agent-1',
    modelConfig: { provider: 'openai', model: 'gpt-4o', temperature: 0, maxTokens: 100 }
  };

  const mockTool: ToolMetadata = {
    id: 'tool-1',
    name: 'test_action',
    description: 'desc',
    inputSchema: {},
    serverId: 'test-server',
    namespace: 'test-server',
    version: '1.0',
    enabled: true,
    source: 'mcp',
    priority: 1,
    origin: 'mcp://test-server',
    loadedAt: new Date()
  };

  it('should successfully execute a tool', async () => {
    (discovery.resolveTool as jest.Mock).mockResolvedValue(mockTool);
    (connectionFactory.resolveConnection as jest.Mock).mockResolvedValue({ serverId: 'test-server', transport: { type: 'stdio' } });
    
    const mockAdapter = {
      executeTool: jest.fn().mockResolvedValue({ success: true, data: 'result' })
    };
    (mcpManager.getAdapter as jest.Mock).mockReturnValue(mockAdapter);

    const result = await service.executeTool(mockContext, 'test-server.test_action', { arg1: 'val1' });

    expect(eventBus.emitToolExecutionStarted).toHaveBeenCalled();
    expect(discovery.resolveTool).toHaveBeenCalledWith(mockContext, 'test-server.test_action');
    expect(mcpManager.getAdapter).toHaveBeenCalledWith('test-server');
    expect(mockAdapter.executeTool).toHaveBeenCalledWith('test_action', { arg1: 'val1' }, expect.any(Object));
    expect(eventBus.emitToolExecutionCompleted).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should fail and return error if tool not found', async () => {
    (discovery.resolveTool as jest.Mock).mockResolvedValue(null);

    const result = await service.executeTool(mockContext, 'test-server.test_action', {});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('is not available or unauthorized');
    expect(eventBus.emitToolExecutionFailed).toHaveBeenCalled();
  });

  it('should fail and return error if adapter missing', async () => {
    (discovery.resolveTool as jest.Mock).mockResolvedValue(mockTool);
    (mcpManager.getAdapter as jest.Mock).mockReturnValue(undefined);

    const result = await service.executeTool(mockContext, 'test-server.test_action', {});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('is not available');
    expect(eventBus.emitToolExecutionFailed).toHaveBeenCalled();
  });
});
