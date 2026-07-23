export type ExecutionMode = 'interactive' | 'background' | 'batch' | 'agent';

export interface ExecutionContext {
  readonly conversationId?: string;
  readonly runId: string;
  readonly agentId: string;
  readonly workspaceId: string;
  readonly traceId: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly requestId?: string;
  readonly executionMode?: ExecutionMode;
  readonly metadata?: Record<string, unknown>;
  readonly attributes?: Record<string, unknown>;

  // Memory context injected by AgentLoopService before the reasoning loop
  readonly memoryContext?: string;

  // Multi-agent orchestration — delegation depth control
  readonly delegationDepth?: number;
  /**
   * Tracks the maximum allowed depth for agent delegation
   */
  readonly maxDelegationDepth?: number;
  readonly parentRunId?: string;          // Run ID of the orchestrating agent

  /**
   * Optional feature flags for safe migration and A/B testing
   */
  readonly featureFlags?: Record<string, boolean>;

  // Optional configuration that can be passed per-run
  readonly modelConfig?: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens?: number;
  };
}

/** Default max delegation depth to prevent infinite loops */
export const DEFAULT_MAX_DELEGATION_DEPTH = 3;
