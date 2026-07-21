import { Execution, ExecutionDto } from './types';

export function mapExecutionToDomain(dto: ExecutionDto): Execution {
  return {
    id: dto.id,
    workflowId: dto.workflowId,
    status: dto.status,
    startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
    completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
    durationMs: dto.durationMs,
    result: dto.result,
    logs: dto.logs,
    plannerState: dto.plannerState,
    memoryContext: dto.memoryContext,
    toolCalls: dto.toolCalls,
    delegations: dto.delegations,
  };
}
