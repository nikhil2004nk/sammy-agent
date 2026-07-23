export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
}

export interface Task {
  id: string;
  goal: string;
  dependsOn: string[];
  requiredCapabilities: string[];
  status: TaskStatus;
}
