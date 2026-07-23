import { ExecutionPlan } from '../models/execution-plan.model';
import { Intent } from './intent.interface';

export interface ReflectionResult {
  isComplete: boolean;
  feedback: string;
  confidence: number;
}

export interface IReflectionEngine {
  reflect(plan: ExecutionPlan, intent: Intent): Promise<ReflectionResult>;
}
