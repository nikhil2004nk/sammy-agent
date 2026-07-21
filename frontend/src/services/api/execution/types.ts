export interface ExecutionDto {
  id: string;
  workflowId: string;
  status: 'Draft' | 'Active' | 'Running' | 'Waiting Approval' | 'Completed' | 'Failed' | 'Cancelled';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  result?: any;
  logs?: any[];
  plannerState?: any;
  memoryContext?: any;
  toolCalls?: any[];
  delegations?: any[];
}

export interface Execution {
  id: string;
  workflowId: string;
  status: 'Draft' | 'Active' | 'Running' | 'Waiting Approval' | 'Completed' | 'Failed' | 'Cancelled';
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  result?: any;
  logs?: any[];
  plannerState?: any;
  memoryContext?: any;
  toolCalls?: any[];
  delegations?: any[];
}
