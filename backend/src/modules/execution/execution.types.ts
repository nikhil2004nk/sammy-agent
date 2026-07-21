import { RunStatus, ExecutionNodeStatus, ExecutionNodeType } from '@prisma/client';
export { RunStatus, ExecutionNodeStatus, ExecutionNodeType };

export interface Run {
  id: string;
  conversationId: string;
  status: RunStatus;
  createdAt: number;
  endedAt?: number;
  terminationReason?: string;
  metadata?: Record<string, any>;
  version: number;
  toolCount?: number;
  reasoningCount?: number;
  totalTokens?: number;
  estimatedCost?: number;
  durationMs?: number;
}

export interface ExecutionNode {
  id: string;
  runId: string;
  parentId?: string; // useful for nested workflows
  type: ExecutionNodeType;
  status: ExecutionNodeStatus;
  title: string;
  payload?: any;
  artifactType?: string;
  artifactId?: string;
  startedAt: number;
  finishedAt?: number;
  duration?: number;
  agentName?: string;
}

export interface RunWithNodes extends Run {
  nodes: ExecutionNode[];
}
