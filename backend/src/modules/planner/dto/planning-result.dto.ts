import { ExecutionPlan } from '../models/execution-plan.model';

export interface PlanningResult {
  success: boolean;
  plan?: ExecutionPlan;
  reasoning: string;
  confidence: number;
  errors?: string[];
}
