import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowGraph } from './workflow.types';
import { WorkflowStatus } from '@prisma/client';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, name: string, description: string | undefined, graph: WorkflowGraph) {
    const workflow = await this.prisma.workflow.create({
      data: { workspaceId, name, description, graph: graph as any, status: WorkflowStatus.DRAFT }
    });
    this.logger.log(`Created workflow '${name}' [${workflow.id}] for workspace '${workspaceId}'`);
    return workflow;
  }

  async findAll(workspaceId: string) {
    return this.prisma.workflow.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(workflowId: string) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new NotFoundException(`Workflow '${workflowId}' not found`);
    return workflow;
  }

  async activate(workflowId: string) {
    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: { status: WorkflowStatus.ACTIVE }
    });
  }

  async archive(workflowId: string) {
    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: { status: WorkflowStatus.ARCHIVED }
    });
  }
}
