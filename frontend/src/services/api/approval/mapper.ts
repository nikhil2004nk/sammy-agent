import { Approval, ApprovalDto } from './types';

export function mapApprovalToDomain(dto: ApprovalDto): Approval {
  return {
    id: dto.id,
    runId: dto.runId,
    tool: dto.tool,
    arguments: dto.arguments,
    status: dto.status,
    reason: dto.reason,
    createdAt: new Date(dto.createdAt),
  };
}
