import { Injectable, Logger } from '@nestjs/common';
import { IMcpAdapter } from '../interfaces/mcp-adapter.interface';
import { ToolMetadata, ToolExecutionResult, ServerInfo, McpResource, McpPrompt, AdapterState } from '../types/mcp.types';
import { ToolExecutionException } from '../exceptions/mcp.exceptions';
import { ResolvedConnection } from '../../connections/types/connection.types';

@Injectable()
export class GoogleMcpAdapter implements IMcpAdapter {
  private readonly logger = new Logger(GoogleMcpAdapter.name);
  public readonly serverId: string;
  private state: AdapterState = AdapterState.Idle;

  constructor(serverId: string) {
    this.serverId = serverId;
  }

  getState(): AdapterState {
    return this.state;
  }

  async connect(command: string, args: string[]): Promise<void> {
    this.state = AdapterState.Connecting;
    this.logger.log(`[GoogleAdapter] Initializing mocked connection to Google APIs`);
    // Mock connection
    this.state = AdapterState.Connected;
    this.logger.log(`[GoogleAdapter] Connection established to Google APIs`);
  }

  async disconnect(): Promise<void> {
    this.logger.log(`[GoogleAdapter] Closing connection to Google APIs`);
    this.state = AdapterState.Closed;
  }

  async discoverCapabilities(): Promise<string[]> {
    return ['tools'];
  }

  async discoverTools(): Promise<ToolMetadata[]> {
    this.logger.log(`[GoogleAdapter] Discovering Google tools`);
    return [
      {
        id: 'google-search',
        name: 'google_search',
        description: 'Perform a Google search',
        serverId: this.serverId,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        },
        requiresApproval: false
      },
      {
        id: 'gmail-send',
        name: 'gmail_send',
        description: 'Send an email via Gmail',
        serverId: this.serverId,
        inputSchema: {
          type: 'object',
          properties: {
            to: { type: 'string' },
            subject: { type: 'string' },
            body: { type: 'string' }
          },
          required: ['to', 'subject', 'body']
        },
        requiresApproval: true
      }
    ];
  }

  async discoverResources(): Promise<McpResource[]> {
    return [];
  }

  async discoverPrompts(): Promise<McpPrompt[]> {
    return [];
  }

  async executeTool(toolName: string, args: Record<string, any>, resolvedConnection?: ResolvedConnection): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    this.logger.log(`[GoogleAdapter] Executing tool '${toolName}'`);

    const accessToken = resolvedConnection?.authentication?.environment?.['GOOGLE_ACCESS_TOKEN'];
    if (!accessToken) {
      throw new ToolExecutionException(this.serverId, toolName, new Error('Missing Google access token in resolved connection'));
    }

    try {
      let resultData: any;
      if (toolName === 'google_search') {
        // Mock google search
        resultData = `Search results for "${args.query}" via Google API (mock)`;
      } else if (toolName === 'gmail_send') {
        // Mock gmail send
        resultData = `Email sent to ${args.to} with subject "${args.subject}" (mock)`;
      } else {
        throw new Error(`Tool ${toolName} not supported by GoogleAdapter`);
      }
      
      const duration = Date.now() - startTime;
      return {
        success: true,
        data: resultData,
        duration,
        serverId: this.serverId,
        toolName,
        metadata: {
          provider: 'google'
        }
      };
    } catch (error) {
      this.logger.error(`[GoogleAdapter] Tool execution failed for '${toolName}'`);
      throw new ToolExecutionException(this.serverId, toolName, error);
    }
  }

  getServerInfo(): ServerInfo {
    return {
      name: 'Google APIs',
      version: '1.0.0',
      protocolVersion: 'latest',
    };
  }

  async streamTool(toolName: string, args: Record<string, any>): Promise<any> {
    throw new Error('Streaming not implemented yet in GoogleAdapter');
  }
}
