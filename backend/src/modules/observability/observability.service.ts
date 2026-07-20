import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { 
  ExecutionStartedEvent, 
  ExecutionFinishedEvent, 
  ToolCalledEvent, 
  ToolFinishedEvent, 
  ErrorEvent 
} from '../events/event-bus.service';

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  @OnEvent('execution.started')
  handleExecutionStarted(event: ExecutionStartedEvent) {
    this.logger.log(`[Trace: ${event.traceId}] Execution started for Agent ${event.agentId}`);
  }

  @OnEvent('execution.finished')
  handleExecutionFinished(event: ExecutionFinishedEvent) {
    this.logger.log(`[Trace: ${event.traceId}] Execution finished successfully.`);
  }

  @OnEvent('tool.called')
  handleToolCalled(event: ToolCalledEvent) {
    this.logger.log(`[Trace: ${event.traceId}] Tool '${event.payload.toolName}' called.`);
  }

  @OnEvent('tool.finished')
  handleToolFinished(event: ToolFinishedEvent) {
    this.logger.log(`[Trace: ${event.traceId}] Tool '${event.payload.toolName}' finished successfully.`);
  }

  @OnEvent('error')
  handleError(event: ErrorEvent) {
    this.logger.error(`[Trace: ${event.traceId}] Execution error: ${JSON.stringify(event.payload)}`);
  }
}
