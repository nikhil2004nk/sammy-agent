import { McpAdapterService } from './mcp-adapter.service';
import { McpConnectionException, McpDiscoveryException, ToolExecutionException } from '../exceptions/mcp.exceptions';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/stdio.js');

describe('McpAdapterService', () => {
  let adapter: McpAdapterService;
  let mockClient: jest.Mocked<Client>;
  let mockTransport: jest.Mocked<StdioClientTransport>;

  beforeEach(() => {
    adapter = new McpAdapterService('test-server');
    mockClient = {
      connect: jest.fn(),
      listTools: jest.fn(),
      callTool: jest.fn(),
      getServerVersion: jest.fn(),
    } as any;
    
    mockTransport = {
      close: jest.fn(),
    } as any;

    (Client as jest.Mock).mockImplementation(() => mockClient);
    (StdioClientTransport as jest.Mock).mockImplementation(() => mockTransport);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      mockClient.connect.mockResolvedValue(undefined);
      await expect(adapter.connect('node', ['script.js'])).resolves.not.toThrow();
      expect(Client).toHaveBeenCalled();
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should throw McpConnectionException on failure', async () => {
      mockClient.connect.mockRejectedValue(new Error('Connection timeout'));
      await expect(adapter.connect('node', ['script.js'])).rejects.toThrow(McpConnectionException);
    });
  });

  describe('discoverTools', () => {
    it('should return mapped ToolMetadata array', async () => {
      adapter['client'] = mockClient; // Inject mock directly since connect sets it
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'test_tool', description: 'desc', inputSchema: {} }
        ]
      } as any);

      const tools = await adapter.discoverTools();
      
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('test_tool');
      expect(tools[0].serverId).toBe('test-server');
      expect(tools[0].origin).toBe('mcp://test-server');
    });

    it('should throw McpDiscoveryException on failure', async () => {
      adapter['client'] = mockClient;
      mockClient.listTools.mockRejectedValue(new Error('Discovery failed'));
      await expect(adapter.discoverTools()).rejects.toThrow(McpDiscoveryException);
    });
  });

  describe('executeTool', () => {
    it('should execute and return ToolExecutionResult', async () => {
      adapter['client'] = mockClient;
      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'success' }],
        isError: false,
      } as any);

      const result = await adapter.executeTool('test_tool', { key: 'value' });
      
      expect(result.success).toBe(true);
      expect(result.toolName).toBe('test_tool');
      expect(result.data).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should throw ToolExecutionException on sdk failure', async () => {
      adapter['client'] = mockClient;
      mockClient.callTool.mockRejectedValue(new Error('Tool failed'));
      
      await expect(adapter.executeTool('test_tool', {})).rejects.toThrow(ToolExecutionException);
    });
  });
});
