import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { McpManagerService } from './mcp-manager.service';
import { McpAdapterService } from '../adapter/mcp-adapter.service';
import { AdapterState } from '../types/mcp.types';

jest.mock('../adapter/mcp-adapter.service');

describe('McpManagerService', () => {
  let manager: McpManagerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpManagerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              servers: {
                test1: {
                  enabled: true,
                  transport: 'stdio',
                  command: 'node',
                  args: ['script.js'],
                  retry: { maxAttempts: 1, backoffMs: 10 }
                },
                test2: {
                  enabled: false,
                  transport: 'stdio'
                }
              }
            })
          }
        }
      ],
    }).compile();

    manager = module.get<McpManagerService>(McpManagerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onApplicationBootstrap', () => {
    it('should initialize enabled servers asynchronously', async () => {
      // Mock the adapter connect method to resolve
      (McpAdapterService.prototype.connect as jest.Mock).mockResolvedValue(undefined);
      
      await manager.onApplicationBootstrap();
      
      // Since initialization is async and we didn't await the inner promise, 
      // we need a small tick to let the promise resolve in the event loop.
      await new Promise(process.nextTick);

      const adapters = manager.getAllAdapters();
      expect(adapters.size).toBe(1);
      expect(adapters.has('test1')).toBe(true);
      expect(adapters.has('test2')).toBe(false); // Was disabled
    });

    it('should handle adapter connection failures and retry', async () => {
      // Mock connect to fail
      (McpAdapterService.prototype.connect as jest.Mock).mockRejectedValue(new Error('Connection failed'));
      
      await manager.onApplicationBootstrap();
      // Wait for the retry loop to exhaust (maxAttempts: 1)
      await new Promise(resolve => setTimeout(resolve, 50));

      const adapters = manager.getAllAdapters();
      expect(adapters.size).toBe(1);
      
      // The adapter exists but its connect method threw. 
      // McpManagerService catches it.
      expect(McpAdapterService.prototype.connect).toHaveBeenCalled();
    });
  });

  describe('onApplicationShutdown', () => {
    it('should disconnect all adapters', async () => {
      await manager.onApplicationBootstrap();
      await new Promise(process.nextTick);

      (McpAdapterService.prototype.disconnect as jest.Mock).mockResolvedValue(undefined);
      
      await manager.onApplicationShutdown();
      expect(McpAdapterService.prototype.disconnect).toHaveBeenCalled();
    });
  });
});
