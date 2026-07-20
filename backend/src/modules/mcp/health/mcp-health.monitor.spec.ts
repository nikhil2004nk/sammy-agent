import { Test, TestingModule } from '@nestjs/testing';
import { McpHealthMonitor } from './mcp-health.monitor';
import { McpManagerService } from '../manager/mcp-manager.service';
import { EventBusService } from '../../events/event-bus.service';
import { McpAdapterService } from '../adapter/mcp-adapter.service';
import { AdapterState } from '../types/mcp.types';

describe('McpHealthMonitor', () => {
  let monitor: McpHealthMonitor;
  let manager: McpManagerService;
  let eventBus: EventBusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpHealthMonitor,
        {
          provide: McpManagerService,
          useValue: {
            getAllAdapters: jest.fn(),
          },
        },
        {
          provide: EventBusService,
          useValue: {
            emitServerUnhealthy: jest.fn(),
            emitServerHealthy: jest.fn(),
          },
        },
      ],
    }).compile();

    monitor = module.get<McpHealthMonitor>(McpHealthMonitor);
    manager = module.get<McpManagerService>(McpManagerService);
    eventBus = module.get<EventBusService>(EventBusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkHealth', () => {
    it('should emit unhealthy event for failed adapter', async () => {
      const mockAdapter = { getState: () => AdapterState.Failed } as McpAdapterService;
      const adapters = new Map<string, McpAdapterService>();
      adapters.set('test-server', mockAdapter);

      (manager.getAllAdapters as jest.Mock).mockReturnValue(adapters);

      await monitor.checkHealth();

      expect(eventBus.emitServerUnhealthy).toHaveBeenCalledWith(expect.any(String), 'test-server', expect.any(String));
      expect(eventBus.emitServerHealthy).not.toHaveBeenCalled();
    });

    it('should emit healthy event for connected adapter', async () => {
      const mockAdapter = { getState: () => AdapterState.Connected } as McpAdapterService;
      const adapters = new Map<string, McpAdapterService>();
      adapters.set('test-server', mockAdapter);

      (manager.getAllAdapters as jest.Mock).mockReturnValue(adapters);

      await monitor.checkHealth();

      expect(eventBus.emitServerHealthy).toHaveBeenCalledWith(expect.any(String), 'test-server');
      expect(eventBus.emitServerUnhealthy).not.toHaveBeenCalled();
    });

    it('should ignore reconnecting adapter', async () => {
      const mockAdapter = { getState: () => AdapterState.Reconnecting } as McpAdapterService;
      const adapters = new Map<string, McpAdapterService>();
      adapters.set('test-server', mockAdapter);

      (manager.getAllAdapters as jest.Mock).mockReturnValue(adapters);

      await monitor.checkHealth();

      expect(eventBus.emitServerHealthy).not.toHaveBeenCalled();
      expect(eventBus.emitServerUnhealthy).not.toHaveBeenCalled();
    });
  });
});
