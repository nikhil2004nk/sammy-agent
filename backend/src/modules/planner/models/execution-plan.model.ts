import { Intent } from '../interfaces/intent.interface';
import { Task } from './task.model';

export interface PlanMetadata {
  estimatedComplexity: number;
  generatedAt: Date;
  version: number;
}

export interface ExecutionPlan {
  id: string;
  originalIntent: Intent;
  tasks: Task[];
  metadata: PlanMetadata;
}
