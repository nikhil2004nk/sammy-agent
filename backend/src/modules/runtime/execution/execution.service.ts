import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { EventBusService } from '../../events/event-bus.service';
import { AgentLoopService } from '../agent-loop/agent-loop.service';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly agentLoop: AgentLoopService,
  ) {}

  /**
   * The entry point for execution. Delegates to the Agent Loop.
   */
  async executeTurn(context: ExecutionContext, userInput: string): Promise<string> {
    this.eventBus.emitExecutionStarted(context.traceId, context.agentId, context.conversationId || 'unknown');
    this.logger.log(`Starting execution turn for traceId: ${context.traceId}`);

    try {
      const finalResponse = await this.agentLoop.runLoop(context, context.conversationId || 'unknown', userInput);
      this.logger.log(`Finished execution turn for traceId: ${context.traceId}`);
      this.eventBus.emitExecutionFinished(context.traceId, context.agentId, context.conversationId || 'unknown', finalResponse);
      return finalResponse;
    } catch (error) {
      this.logger.error(`Execution failed for traceId: ${context.traceId}`, error);
      throw error;
    }
  }
}
