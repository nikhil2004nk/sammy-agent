export type ExecutionMode = 'interactive' | 'background' | 'batch' | 'agent';

export interface ExecutionContext {
  readonly conversationId: string;
  readonly runId: string;
  readonly agentId: string;
  readonly tenantId?: string;
  readonly userId: string;
  readonly traceId: string;
  readonly sessionId?: string;
  readonly requestId?: string;
  readonly executionMode?: ExecutionMode;
  readonly metadata?: Record<string, any>;
  readonly attributes?: Record<string, any>;
  
  // Optional configuration that can be passed per-run
  readonly modelConfig?: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
}
