export enum TaskStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  READY = 'READY',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED',
  SKIPPED = 'SKIPPED',
}

export interface Task {
  id: string;
  type?: string; // 'TASK', 'CONDITION', 'LOOP', etc.
  config?: Record<string, any>;
  goal: string;
  dependsOn: string[];
  requiredCapabilities: string[];
  status: TaskStatus;
}
