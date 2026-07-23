import { Injectable, Logger } from '@nestjs/common';
import { AgentLoopService } from './agent-loop.service';
import { DelegationResult } from './agent.types';
import { ExecutionContext, DEFAULT_MAX_DELEGATION_DEPTH } from '../../../common/execution-context';
import * as crypto from 'crypto';

/**
 * AgentOrchestratorService
 *
 * Handles multi-agent delegation. When the Planner emits a `delegate` action,
 * this service spawns a sub-agent run with its own runId, bounded by maxDelegationDepth.
 *
 * Depth control: Default max=3. Orchestrator=depth 0, Worker=depth 1, etc.
 * Unlimited nesting is disabled to prevent infinite delegation loops.
 */
@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(private readonly agentLoop: AgentLoopService) {}

  async delegate(
    parentContext: ExecutionContext,
    goal: string,
    conversationId: string,
    agentId?: string,
  ): Promise<DelegationResult> {
    const currentDepth = parentContext.delegationDepth ?? 0;
    const maxDepth = parentContext.maxDelegationDepth ?? DEFAULT_MAX_DELEGATION_DEPTH;
    const targetAgentId = agentId || parentContext.agentId;

    if (currentDepth >= maxDepth) {
      this.logger.warn(
        `Delegation rejected: max depth (${maxDepth}) reached. Parent run: '${parentContext.runId}'`
      );
      return {
        success: false,
        agentId: targetAgentId,
        runId: parentContext.runId,
        status: 'FAILED',
        errors: [`Delegation blocked: maximum delegation depth of ${maxDepth} reached`]
      };
    }

    const subRunId = crypto.randomUUID();
    const subTraceId = parentContext.traceId; // Keep same trace for observability

    const subContext: ExecutionContext = {
      ...parentContext,
      runId: subRunId,
      agentId: targetAgentId,
      traceId: subTraceId,
      delegationDepth: currentDepth + 1,
      maxDelegationDepth: maxDepth,
      parentRunId: parentContext.runId,
    };

    this.logger.log(
      `Delegating sub-goal to agent '${subContext.agentId}' ` +
      `[depth: ${currentDepth + 1}/${maxDepth}] ` +
      `[subRun: '${subRunId}'] ` +
      `[parent: '${parentContext.runId}']`
    );

    try {
      // Spawn sub-agent in the same conversation thread
      const result = await this.agentLoop.runLoop(subContext, conversationId, goal);

      this.logger.log(`Sub-agent run '${subRunId}' completed. Returning result to orchestrator.`);
      return {
        success: true,
        agentId: subContext.agentId,
        runId: subRunId,
        status: 'COMPLETED',
        output: result
      };
    } catch (error: any) {
      this.logger.error(`Sub-agent run '${subRunId}' failed`, error);
      return {
        success: false,
        agentId: subContext.agentId,
        runId: subRunId,
        status: 'FAILED',
        errors: [error.message || String(error)]
      };
    }
  }
}
