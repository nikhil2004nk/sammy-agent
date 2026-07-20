import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class AgentEvent {
  constructor(
    public readonly traceId: string,
    public readonly agentId: string,
    public readonly conversationId: string,
    public readonly payload: any,
  ) {}
}

export class ToolCalledEvent extends AgentEvent {}
export class ToolFinishedEvent extends AgentEvent {}
export class ExecutionStartedEvent extends AgentEvent {}
export class ExecutionFinishedEvent extends AgentEvent {}
export class ErrorEvent extends AgentEvent {}

@Injectable()
export class EventBusService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitExecutionStarted(traceId: string, agentId: string, conversationId: string, metadata?: any) {
    this.eventEmitter.emit('execution.started', new ExecutionStartedEvent(traceId, agentId, conversationId, metadata));
  }

  emitExecutionFinished(traceId: string, agentId: string, conversationId: string, result?: any) {
    this.eventEmitter.emit('execution.finished', new ExecutionFinishedEvent(traceId, agentId, conversationId, result));
  }

  emitToolCalled(traceId: string, agentId: string, conversationId: string, toolName: string, args: any) {
    this.eventEmitter.emit('tool.called', new ToolCalledEvent(traceId, agentId, conversationId, { toolName, args }));
  }

  emitToolFinished(traceId: string, agentId: string, conversationId: string, toolName: string, result: any) {
    this.eventEmitter.emit('tool.finished', new ToolFinishedEvent(traceId, agentId, conversationId, { toolName, result }));
  }

  emitError(traceId: string, agentId: string, conversationId: string, error: any) {
    this.eventEmitter.emit('error', new ErrorEvent(traceId, agentId, conversationId, error));
  }
}
