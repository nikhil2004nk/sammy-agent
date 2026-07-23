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

export class ServerConnectedEvent extends AgentEvent {}
export class ServerDisconnectedEvent extends AgentEvent {}
export class ServerHealthyEvent extends AgentEvent {}
export class ServerUnhealthyEvent extends AgentEvent {}

export class DiscoveryStartedEvent extends AgentEvent {}
export class DiscoveryFinishedEvent extends AgentEvent {}
export class ToolDiscoveredEvent extends AgentEvent {}
export class ResourceDiscoveredEvent extends AgentEvent {}
export class PromptDiscoveredEvent extends AgentEvent {}

export class ToolExecutionStartedEvent extends AgentEvent {}
export class ToolExecutionCompletedEvent extends AgentEvent {}
export class ToolExecutionFailedEvent extends AgentEvent {}

export class MemoryCreatedEvent extends AgentEvent {}
export class MemoryUpdatedEvent extends AgentEvent {}
export class MemoryDeletedEvent extends AgentEvent {}
export class MemoryExpiredEvent extends AgentEvent {}
export class MemoryCompressedEvent extends AgentEvent {}

@Injectable()
export class EventBusService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitServerConnected(traceId: string, serverId: string) {
    this.eventEmitter.emit('mcp.server.connected', new ServerConnectedEvent(traceId, 'system', 'system', { serverId }));
  }

  emitServerDisconnected(traceId: string, serverId: string) {
    this.eventEmitter.emit('mcp.server.disconnected', new ServerDisconnectedEvent(traceId, 'system', 'system', { serverId }));
  }

  emitServerHealthy(traceId: string, serverId: string) {
    this.eventEmitter.emit('mcp.server.healthy', new ServerHealthyEvent(traceId, 'system', 'system', { serverId }));
  }

  emitServerUnhealthy(traceId: string, serverId: string, reason?: string) {
    this.eventEmitter.emit('mcp.server.unhealthy', new ServerUnhealthyEvent(traceId, 'system', 'system', { serverId, reason }));
  }

  emitDiscoveryStarted(traceId: string, serverId: string) {
    this.eventEmitter.emit('mcp.discovery.started', new DiscoveryStartedEvent(traceId, 'system', 'system', { serverId }));
  }

  emitDiscoveryFinished(traceId: string, serverId: string, counts: any) {
    this.eventEmitter.emit('mcp.discovery.finished', new DiscoveryFinishedEvent(traceId, 'system', 'system', { serverId, counts }));
  }

  emitToolDiscovered(traceId: string, toolMetadata: any) {
    this.eventEmitter.emit('mcp.tool.discovered', new ToolDiscoveredEvent(traceId, 'system', 'system', { tool: toolMetadata }));
  }

  emitResourceDiscovered(traceId: string, resourceMetadata: any) {
    this.eventEmitter.emit('mcp.resource.discovered', new ResourceDiscoveredEvent(traceId, 'system', 'system', { resource: resourceMetadata }));
  }

  emitPromptDiscovered(traceId: string, promptMetadata: any) {
    this.eventEmitter.emit('mcp.prompt.discovered', new PromptDiscoveredEvent(traceId, 'system', 'system', { prompt: promptMetadata }));
  }

  emitToolExecutionStarted(traceId: string, agentId: string, toolName: string, args: any) {
    this.eventEmitter.emit('tool.execution.started', new ToolExecutionStartedEvent(traceId, agentId, 'system', { toolName, args }));
  }

  emitToolExecutionCompleted(traceId: string, agentId: string, toolName: string, duration: number, result: any) {
    this.eventEmitter.emit('tool.execution.completed', new ToolExecutionCompletedEvent(traceId, agentId, 'system', { toolName, duration, result }));
  }

  emitToolExecutionFailed(traceId: string, agentId: string, toolName: string, duration: number, error: any) {
    this.eventEmitter.emit('tool.execution.failed', new ToolExecutionFailedEvent(traceId, agentId, 'system', { toolName, duration, error }));
  }

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

  emitMemoryCreated(traceId: string, agentId: string, memoryRecord: any) {
    this.eventEmitter.emit('memory.created', new MemoryCreatedEvent(traceId, agentId, 'system', { record: memoryRecord }));
  }

  emitMemoryUpdated(traceId: string, agentId: string, memoryRecord: any) {
    this.eventEmitter.emit('memory.updated', new MemoryUpdatedEvent(traceId, agentId, 'system', { record: memoryRecord }));
  }

  emitMemoryDeleted(traceId: string, agentId: string, memoryId: string) {
    this.eventEmitter.emit('memory.deleted', new MemoryDeletedEvent(traceId, agentId, 'system', { memoryId }));
  }

  emitMemoryExpired(traceId: string, agentId: string, memoryId: string) {
    this.eventEmitter.emit('memory.expired', new MemoryExpiredEvent(traceId, agentId, 'system', { memoryId }));
  }

  emitMemoryCompressed(traceId: string, agentId: string, compressedRecords: any[]) {
    this.eventEmitter.emit('memory.compressed', new MemoryCompressedEvent(traceId, agentId, 'system', { compressedRecords }));
  }
}
