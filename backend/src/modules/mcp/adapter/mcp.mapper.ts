import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolMetadata, McpResource, McpPrompt } from '../types/mcp.types';
import * as crypto from 'crypto';

export class McpMapper {
  static mapTool(serverId: string, sdkTool: Tool): ToolMetadata {
    return {
      id: crypto.randomUUID(),
      name: sdkTool.name,
      description: sdkTool.description || '',
      inputSchema: sdkTool.inputSchema,
      serverId: serverId,
      namespace: serverId, // Tools are namespaced by server by default
      version: '1.0.0', // MCP SDK doesn't expose tool version currently
      enabled: true,
      source: 'mcp',
      priority: 100, // Default MCP priority
      origin: `mcp://${serverId}`,
      loadedAt: new Date(),
    };
  }

  // Placeholder for resource mapping
  static mapResource(sdkResource: any): McpResource {
    return {
      uri: sdkResource.uri,
      name: sdkResource.name,
      description: sdkResource.description,
      mimeType: sdkResource.mimeType,
    };
  }

  // Placeholder for prompt mapping
  static mapPrompt(sdkPrompt: any): McpPrompt {
    return {
      name: sdkPrompt.name,
      description: sdkPrompt.description,
      arguments: sdkPrompt.arguments,
    };
  }
}
