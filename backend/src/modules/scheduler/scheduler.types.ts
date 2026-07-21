// -------------------------------------------------------
// Scheduler Types
// -------------------------------------------------------

export interface ScheduledJobConfig {
  workspaceId: string;
  agentId?: string;
  name: string;
  cronExpr: string;   // Standard 5-field cron expression, e.g. '0 9 * * 1-5'
  goal: string;       // Natural language goal passed to the agent
  enabled?: boolean;
}

export interface ScheduledJobRecord extends ScheduledJobConfig {
  id: string;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
