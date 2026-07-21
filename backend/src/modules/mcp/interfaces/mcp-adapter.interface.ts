import { ToolMetadata, ToolExecutionResult, ServerInfo, McpResource, McpPrompt, AdapterState } from '../types/mcp.types';

export interface IMcpAdapter {
  readonly serverId: string;
  getState(): AdapterState;
  connect(command: string, args: string[]): Promise<void>;
  disconnect(): Promise<void>;
  discoverCapabilities(): Promise<string[]>;
  discoverTools(): Promise<ToolMetadata[]>;
  discoverResources(): Promise<McpResource[]>;
  discoverPrompts(): Promise<McpPrompt[]>;
  executeTool(toolName: string, args: Record<string, any>, resolvedConnection?: any): Promise<ToolExecutionResult>;
  getServerInfo(): ServerInfo;
  streamTool(toolName: string, args: Record<string, any>): Promise<any>;
}
