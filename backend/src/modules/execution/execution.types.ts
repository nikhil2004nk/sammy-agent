export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'requires_action';

export interface Run {
  id: string;
  conversationId: string;
  status: RunStatus;
  createdAt: number;
  endedAt?: number;
  terminationReason?: string;
  metadata?: Record<string, any>;
  version: number;
}

export type ExecutionNodeType = 'reasoning' | 'tool' | 'message' | 'plan';
export type ExecutionNodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionNode {
  id: string;
  runId: string;
  parentId?: string; // useful for nested workflows
  type: ExecutionNodeType;
  status: ExecutionNodeStatus;
  title: string;
  payload?: any;
  startedAt: number;
  finishedAt?: number;
  duration?: number;
  agentName?: string;
}

export interface RunWithNodes extends Run {
  nodes: ExecutionNode[];
}
