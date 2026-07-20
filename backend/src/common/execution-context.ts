export interface ModelConfig {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ExecutionContext {
  traceId: string;
  conversationId: string;
  userId: string;
  tenantId?: string;
  agentId: string;
  toolCalls: any[];
  toolResults?: { toolName: string; result: any }[];
  modelConfig: ModelConfig;
  memoryData?: any;
  metadata: Record<string, any>;
}
