import { RunStatus, ExecutionNodeType, ExecutionNodeStatus } from '../execution.types';

export class ExecutionNodeDto {
  id: string;
  type: ExecutionNodeType;
  status: ExecutionNodeStatus;
  title: string;
  summary?: string;
  startedAt: number;
  finishedAt?: number;
  duration?: number;
  payload?: any;
}

export class RunDto {
  id: string;
  status: RunStatus;
  startedAt: number;
  finishedAt?: number;
  duration?: number;
  nodes: ExecutionNodeDto[];
}
