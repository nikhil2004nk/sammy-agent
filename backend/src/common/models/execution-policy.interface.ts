import { ResourceBudget } from './resource-budget.model';

export interface IExecutionPolicy {
  canRetry(failedAttempts: number, budget: ResourceBudget): boolean;
  canContinue(budget: ResourceBudget, metrics: any): boolean;
  shouldCancelOnFailure(criticality: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'): boolean;
  canExceedBudget(budgetType: keyof ResourceBudget): boolean;
}
