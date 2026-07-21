import { Workflow, WorkflowDto } from './types';

export function mapWorkflowToDomain(dto: WorkflowDto): Workflow {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    definition: dto.definition,
    status: dto.status,
    version: dto.version,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
