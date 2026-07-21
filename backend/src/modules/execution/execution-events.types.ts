import { ExecutionNodeType, ExecutionNodeStatus, RunStatus } from '@prisma/client';

export type ExecutionEventType =
  | 'run.started'
  | 'run.updated'
  | 'run.completed'
  | 'run.failed'
  | 'node.created'
  | 'node.updated'
  | 'message.delta'
  | 'message.completed'
  // Reserved for future
  | 'planner.started'
  | 'planner.completed'
  | 'workflow.started'
  | 'workflow.completed'
  | 'approval.requested'
  | 'approval.received'
  | 'agent.spawned'
  | 'agent.completed'
  | 'memory.read'
  | 'memory.write';

export interface RunStartedPayload {
  conversationId: string;
}

export interface RunUpdatedPayload {
  status: RunStatus;
  toolCount?: number;
  reasoningCount?: number;
}

export interface RunCompletedPayload {
  durationMs?: number;
  terminationReason?: string;
}

export interface RunFailedPayload {
  durationMs?: number;
  error?: string;
  terminationReason?: string;
}

export interface NodeCreatedPayload {
  id: string;
  type: ExecutionNodeType;
  title: string;
  status: ExecutionNodeStatus;
  startedAt: number;
  payload?: any;
  agentName?: string;
  parentId?: string;
}

export interface NodeUpdatedPayload {
  id: string;
  status: ExecutionNodeStatus;
  finishedAt?: number;
  duration?: number;
  payload?: any;
}

export interface MessageDeltaPayload {
  nodeId?: string; // The reasoning node this message is attached to, if any
  delta: string;
}

export interface MessageCompletedPayload {
  nodeId?: string;
  content: string;
}

export type ExecutionEventPayloadMap = {
  'run.started': RunStartedPayload;
  'run.updated': RunUpdatedPayload;
  'run.completed': RunCompletedPayload;
  'run.failed': RunFailedPayload;
  'node.created': NodeCreatedPayload;
  'node.updated': NodeUpdatedPayload;
  'message.delta': MessageDeltaPayload;
  'message.completed': MessageCompletedPayload;
  // Others can just use unknown for now
  'planner.started': unknown;
  'planner.completed': unknown;
  'workflow.started': unknown;
  'workflow.completed': unknown;
  'approval.requested': unknown;
  'approval.received': unknown;
  'agent.spawned': unknown;
  'agent.completed': unknown;
  'memory.read': unknown;
  'memory.write': unknown;
};

export interface ExecutionEvent<T extends ExecutionEventType = ExecutionEventType> {
  version: 1;
  id: string;
  runId: string;
  type: T;
  timestamp: string;
  payload: ExecutionEventPayloadMap[T];
}
