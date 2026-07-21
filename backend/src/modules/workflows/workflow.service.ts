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

  async findOne(workspaceId: string, workflowId: string) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow || workflow.workspaceId !== workspaceId) {
      throw new NotFoundException(`Workflow '${workflowId}' not found in this workspace`);
    }
    return workflow;
  }

  async activate(workspaceId: string, workflowId: string) {
    await this.findOne(workspaceId, workflowId); // verify ownership
    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: { status: WorkflowStatus.ACTIVE }
    });
  }

  async archive(workspaceId: string, workflowId: string) {
    await this.findOne(workspaceId, workflowId); // verify ownership
    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: { status: WorkflowStatus.ARCHIVED }
    });
  }
}
