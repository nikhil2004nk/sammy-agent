export class McpException extends Error {
  constructor(message: string, public readonly serverId?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class McpConnectionException extends McpException {
  constructor(serverId: string, originalError?: any) {
    super(`Failed to connect to MCP server: ${serverId}. Reason: ${originalError?.message || 'Unknown'}`, serverId);
  }
}

export class McpDiscoveryException extends McpException {
  constructor(serverId: string, originalError?: any) {
    super(`Failed to discover tools for MCP server: ${serverId}. Reason: ${originalError?.message || 'Unknown'}`, serverId);
  }
}

export class ToolExecutionException extends McpException {
  constructor(serverId: string, toolName: string, originalError?: any) {
    super(`Failed to execute tool '${toolName}' on server '${serverId}'. Reason: ${originalError?.message || 'Unknown'}`, serverId);
  }
}
