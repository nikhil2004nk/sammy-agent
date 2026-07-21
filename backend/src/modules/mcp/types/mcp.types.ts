export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  provider?: string;
  server?: string;
  category?: string;
  inputSchema: any;
  outputSchema?: any;
  requiresApproval?: boolean;
  supportsStreaming?: boolean;
  supportsBatch?: boolean;
  isReadOnly?: boolean;
  estimatedLatency?: number;
  estimatedCost?: number;
  permissions?: string[];
  serverId?: string; // Legacy, replace with 'server' eventually
  namespace?: string;
  version?: string;
  enabled?: boolean;
  source?: 'mcp' | 'local' | 'plugin';
  priority?: number;
  origin?: string;
  loadedAt?: Date;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  serverId: string;
  toolName: string;
  metadata: Record<string, any>;
}

export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpPrompt {
  name: string;
  description?: string;
  arguments?: any[];
}

export interface ServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
}

export enum AdapterState {
  Idle = 'Idle',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Discovering = 'Discovering',
  Ready = 'Ready',
  Failed = 'Failed',
  Reconnecting = 'Reconnecting',
  Closed = 'Closed'
}
