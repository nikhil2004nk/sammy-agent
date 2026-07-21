import { Test, TestingModule } from '@nestjs/testing';
import { ToolExecutorService } from './tool-executor.service';
import { ToolRegistryService } from '../registry/tool-registry.service';
import { PermissionService } from '../permissions/permission.service';
import { McpManagerService } from '../mcp/manager/mcp-manager.service';
import { EventBusService } from '../events/event-bus.service';
import { ExecutionContext } from '../../common/execution-context';
import { ToolMetadata } from '../mcp/types/mcp.types';

describe('ToolExecutorService', () => {
  let service: ToolExecutorService;
  let registry: ToolRegistryService;
  let permissionService: PermissionService;
  let mcpManager: McpManagerService;
  let eventBus: EventBusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolExecutorService,
        {
          provide: ToolRegistryService,
          useValue: { getTool: jest.fn() },
        },
        {
          provide: PermissionService,
          useValue: { checkToolPermission: jest.fn() },
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
      ],
    }).compile();

    service = module.get<ToolExecutorService>(ToolExecutorService);
    registry = module.get<ToolRegistryService>(ToolRegistryService);
    permissionService = module.get<PermissionService>(PermissionService);
    mcpManager = module.get<McpManagerService>(McpManagerService);
    eventBus = module.get<EventBusService>(EventBusService);
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
    (registry.getTool as jest.Mock).mockReturnValue(mockTool);
    (permissionService.checkToolPermission as jest.Mock).mockResolvedValue(true);
    
    const mockAdapter = {
      executeTool: jest.fn().mockResolvedValue({ success: true, data: 'result' })
    };
    (mcpManager.getAdapter as jest.Mock).mockReturnValue(mockAdapter);

    const result = await service.executeTool(mockContext, 'test-server.test_action', { arg1: 'val1' });

    expect(eventBus.emitToolExecutionStarted).toHaveBeenCalled();
    expect(registry.getTool).toHaveBeenCalledWith('test-server.test_action');
    expect(permissionService.checkToolPermission).toHaveBeenCalled();
    expect(mcpManager.getAdapter).toHaveBeenCalledWith('test-server');
    expect(mockAdapter.executeTool).toHaveBeenCalledWith('test_action', { arg1: 'val1' });
    expect(eventBus.emitToolExecutionCompleted).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should fail and return error if tool not found', async () => {
    (registry.getTool as jest.Mock).mockReturnValue(undefined);

    const result = await service.executeTool(mockContext, 'test-server.test_action', {});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found in registry');
    expect(eventBus.emitToolExecutionFailed).toHaveBeenCalled();
  });

  it('should fail and return error if permission denied', async () => {
    (registry.getTool as jest.Mock).mockReturnValue(mockTool);
    (permissionService.checkToolPermission as jest.Mock).mockResolvedValue(false);

    const result = await service.executeTool(mockContext, 'test-server.test_action', {});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('is not authorized');
    expect(eventBus.emitToolExecutionFailed).toHaveBeenCalled();
  });

  it('should fail and return error if adapter missing', async () => {
    (registry.getTool as jest.Mock).mockReturnValue(mockTool);
    (permissionService.checkToolPermission as jest.Mock).mockResolvedValue(true);
    (mcpManager.getAdapter as jest.Mock).mockReturnValue(undefined);

    const result = await service.executeTool(mockContext, 'test-server.test_action', {});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('is not available');
    expect(eventBus.emitToolExecutionFailed).toHaveBeenCalled();
  });
});
