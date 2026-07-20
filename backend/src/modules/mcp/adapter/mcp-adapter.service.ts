import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ToolMetadata, ToolExecutionResult, ServerInfo, McpResource, McpPrompt, AdapterState } from '../types/mcp.types';
import { McpMapper } from './mcp.mapper';
import { McpConnectionException, McpDiscoveryException, ToolExecutionException } from '../exceptions/mcp.exceptions';

@Injectable()
export class McpAdapterService {
  private readonly logger = new Logger(McpAdapterService.name);
  
  private client: Client;
  private transport: StdioClientTransport; 
  private state: AdapterState = AdapterState.Idle;
  
  constructor(public readonly serverId: string) {}

  getState(): AdapterState {
    return this.state;
  }

  async connect(command: string, args: string[]): Promise<void> {
    this.state = AdapterState.Connecting;
    this.logger.log(`[Adapter] Initializing connection to server '${this.serverId}'`);
    try {
      this.transport = new StdioClientTransport({
        command,
        args,
      });

      this.client = new Client(
        { name: 'SammyAgent', version: '1.0.0' },
        { capabilities: {} }
      );

      await this.client.connect(this.transport);
      this.state = AdapterState.Connected;
      this.logger.log(`[Adapter] Connection established to '${this.serverId}'`);
    } catch (error) {
      this.state = AdapterState.Failed;
      this.logger.error(`[Adapter] Connection failed for '${this.serverId}'`);
      throw new McpConnectionException(this.serverId, error);
    }
  }

  async disconnect(): Promise<void> {
    this.logger.log(`[Adapter] Closing connection to '${this.serverId}'`);
    if (this.transport) {
      await this.transport.close();
      this.state = AdapterState.Closed;
    }
  }

  async discoverCapabilities(): Promise<string[]> {
    // A placeholder to discover what the server supports based on SDK client capabilities.
    // In actual implementation, we might parse client.getServerVersion() or capabilities objects.
    return ['tools', 'resources', 'prompts'];
  }

  async discoverTools(): Promise<ToolMetadata[]> {
    try {
      this.state = AdapterState.Discovering;
      const response = await this.client.listTools();
      const tools = response.tools.map(tool => McpMapper.mapTool(this.serverId, tool));
      this.state = AdapterState.Ready;
      this.logger.log(`[Adapter] Discovered ${tools.length} tools from '${this.serverId}'`);
      return tools;
    } catch (error) {
      this.state = AdapterState.Failed;
      throw new McpDiscoveryException(this.serverId, error);
    }
  }

  async discoverResources(): Promise<McpResource[]> {
    try {
      const response = await this.client.listResources();
      return response.resources.map(res => McpMapper.mapResource(res));
    } catch (error: any) {
      if (error?.code === -32601) {
        this.logger.debug(`[Adapter] Resources not supported by server '${this.serverId}'`);
      } else {
        this.logger.error(`[Adapter] Resource discovery failed for '${this.serverId}'`, error);
      }
      return [];
    }
  }

  async discoverPrompts(): Promise<McpPrompt[]> {
    try {
      const response = await this.client.listPrompts();
      return response.prompts.map(prompt => McpMapper.mapPrompt(prompt));
    } catch (error: any) {
      if (error?.code === -32601) {
        this.logger.debug(`[Adapter] Prompts not supported by server '${this.serverId}'`);
      } else {
        this.logger.error(`[Adapter] Prompt discovery failed for '${this.serverId}'`, error);
      }
      return [];
    }
  }
  async executeTool(toolName: string, args: Record<string, any>, resolvedConnection?: any): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    this.logger.log(`[Adapter] Executing tool '${toolName}' on '${this.serverId}'`);
    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: args,
      });
      
      const duration = Date.now() - startTime;
      this.logger.log(`[Adapter] Tool '${toolName}' executed successfully in ${duration}ms`);

      return {
        success: !result.isError,
        data: result.content,
        duration,
        serverId: this.serverId,
        toolName,
        metadata: { isError: result.isError }
      };
    } catch (error) {
      this.logger.error(`[Adapter] Tool execution failed for '${toolName}'`);
      throw new ToolExecutionException(this.serverId, toolName, error);
    }
  }

  getServerInfo(): ServerInfo {
    const serverResult = this.client.getServerVersion();
    return {
      name: serverResult?.name || 'unknown',
      version: serverResult?.version || 'unknown',
      protocolVersion: 'latest', // SDK handles this transparently
    };
  }

  // Placeholder for streamTool
  async streamTool(toolName: string, args: Record<string, any>): Promise<any> {
    throw new Error('Streaming not implemented yet in Adapter');
  }
}
