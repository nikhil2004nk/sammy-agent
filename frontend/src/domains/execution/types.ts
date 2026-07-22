export type ExecutionStatus = 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';

export type ExecutionNodeType = 'reasoning' | 'tool' | 'planner' | 'approval' | 'workflow' | 'reflection' | 'agent' | 'event';

export interface ExecutionNode {
  id: string;
  runId: string;
  type: ExecutionNodeType;
  status: ExecutionStatus;
  
  // Optional name for identifying the specific tool, agent, etc.
  name?: string;
  
  // Future-proofing: which agent executed this node
  agentName?: string;
  
  // Core data payload
  content?: string; // For text/reasoning
  arguments?: unknown; // JSON args for tools
  result?: unknown; // JSON output from tools or planners
  
  // Timing
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;

  // Tree structuring (for future complex workflows)
  parentId?: string;
}

export interface Run {
  id: string;
  conversationId: string;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  totalTools: number;
  nodes: ExecutionNode[]; // Tree of execution nodes
}

export type ExecutionEventType =
  | 'run.started'
  | 'run.updated'
  | 'run.completed'
  | 'run.failed'
  | 'node.created'
  | 'node.updated'
  | 'message.created'
  | 'message.delta'
  | 'message.completed'
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
  status: ExecutionStatus;
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
  status: ExecutionStatus;
  startedAt: number;
  payload?: any;
  agentName?: string;
  parentId?: string;
}

export interface NodeUpdatedPayload {
  id: string;
  status: ExecutionStatus;
  finishedAt?: number;
  duration?: number;
  payload?: any;
}

export interface MessageDeltaPayload {
  nodeId?: string;
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
  'message.created': { message: any };
  'message.delta': MessageDeltaPayload;
  'message.completed': MessageCompletedPayload;
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
