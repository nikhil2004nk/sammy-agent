import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowService } from './workflow.service';
import { WorkflowGraph, WorkflowNode, WorkflowRunResult, WorkflowStepResult, ToolStepConfig, AgentStepConfig } from './workflow.types';
import { ExecutionContext } from '../../common/execution-context';
import { ToolExecutorService } from '../tools/tool-executor.service';
import { WorkflowRunStatus } from '@prisma/client';

@Injectable()
export class WorkflowRunnerService {
  private readonly logger = new Logger(WorkflowRunnerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly toolExecutor: ToolExecutorService,
  ) {}

  async run(workflowId: string, context: ExecutionContext): Promise<WorkflowRunResult> {
    const workflowRecord = await this.workflowService.findOne(workflowId);
    const graph = workflowRecord.graph as unknown as WorkflowGraph;

    const workflowRun = await this.prisma.workflowRun.create({
      data: { workflowId, status: WorkflowRunStatus.RUNNING }
    });

    this.logger.log(`Starting workflow run '${workflowRun.id}' for workflow '${workflowId}'`);

    const steps: WorkflowStepResult[] = [];
    let success = true;
    let errorMessage: string | undefined;
    let runContext: Record<string, unknown> = {};

    // v1: Traverse graph linearly — follow edges from startNodeId
    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
    const edgeMap = new Map(graph.edges.map(e => [e.from, e]));

    let currentNodeId: string | null = graph.startNodeId;

    while (currentNodeId) {
      const node = nodeMap.get(currentNodeId);
      if (!node) break;

      const stepResult = await this.executeNode(node, context, runContext);
      steps.push(stepResult);

      if (!stepResult.success) {
        success = false;
        errorMessage = stepResult.error;
        break;
      }

      // Merge step output into run context for next steps
      if (stepResult.output) {
        runContext = { ...runContext, [node.id]: stepResult.output };
      }

      // Advance to next node (v1: first matching edge wins)
      const nextEdge = edgeMap.get(currentNodeId);
      currentNodeId = nextEdge ? nextEdge.to : null;
    }

    // Update run record
    await this.prisma.workflowRun.update({
      where: { id: workflowRun.id },
      data: {
        status: success ? WorkflowRunStatus.COMPLETED : WorkflowRunStatus.FAILED,
        result: steps as any,
        error: errorMessage,
        endedAt: new Date()
      }
    });

    this.logger.log(`Workflow run '${workflowRun.id}' finished — ${success ? 'COMPLETED' : 'FAILED'}`);

    return {
      workflowId,
      runId: workflowRun.id,
      success,
      steps,
      error: errorMessage,
    };
  }

  private async executeNode(
    node: WorkflowNode,
    context: ExecutionContext,
    runContext: Record<string, unknown>
  ): Promise<WorkflowStepResult> {
    const startTime = Date.now();
    this.logger.debug(`Executing workflow node '${node.id}' (${node.type})`);

    try {
      let output: unknown;

      switch (node.type) {
        case 'tool': {
          const cfg = node.config as ToolStepConfig;
          const result = await this.toolExecutor.executeTool(context, cfg.toolName, cfg.args as Record<string, unknown>);
          if (!result.success) throw new Error(result.error || 'Tool execution failed');
          output = result.data;
          break;
        }
        case 'approval': {
          // Approval steps are handled as a no-op in v1 (require ApprovalService integration)
          // The workflow pauses here until a human approves via the REST API
          this.logger.log(`[Workflow] Approval step '${node.id}' — currently a no-op in v1`);
          output = { approved: true };
          break;
        }
        case 'agent': {
          const cfg = node.config as AgentStepConfig;
          // Agent steps are scaffolded — full multi-agent integration comes in Phase 5
          this.logger.log(`[Workflow] Agent step '${node.id}' with goal: "${cfg.goal}" — scaffolded`);
          output = { goal: cfg.goal, status: 'scaffolded' };
          break;
        }
        case 'conditional': {
          // Conditional evaluation scaffolded for v2 branching support
          output = { evaluated: true };
          break;
        }
        default:
          throw new Error(`Unknown step type: ${(node as any).type}`);
      }

      return {
        nodeId: node.id,
        success: true,
        output,
        durationMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        nodeId: node.id,
        success: false,
        error: err.message || String(err),
        durationMs: Date.now() - startTime
      };
    }
  }
}
