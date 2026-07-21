import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../common/execution-context';
import { ToolDiscoveryService } from '../registry/tool-discovery.service';
import { McpManagerService } from '../mcp/manager/mcp-manager.service';
import { EventBusService } from '../events/event-bus.service';
import { ToolExecutionResult } from '../mcp/types/mcp.types';
import { ConnectionFactory } from '../connections/factories/connection.factory';
import { ConnectionContext } from '../connections/types/connection.types';
import { ApprovalService } from './approval/approval.service';

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor(
    private readonly discovery: ToolDiscoveryService,
    private readonly mcpManager: McpManagerService,
    private readonly eventBus: EventBusService,
    private readonly connectionFactory: ConnectionFactory,
    private readonly approvalService: ApprovalService,
  ) {}

  async executeTool(context: ExecutionContext, namespacedToolName: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    this.logger.log(`Executing tool '${namespacedToolName}' for agent '${context.agentId}'`);
    this.eventBus.emitToolExecutionStarted(context.traceId, context.agentId, namespacedToolName, args);

    let currentServerId = 'system';
    try {
      // 1. Resolve tool (handles registry lookup, permissions, enabled status)
      const toolMetadata = await this.discovery.resolveTool(context, namespacedToolName);
      if (!toolMetadata) {
        throw new Error(`Tool '${namespacedToolName}' is not available or unauthorized.`);
      }

      currentServerId = toolMetadata.serverId || 'system';

      // 2. Human Approval Gate — persistent, resumable
      if (toolMetadata.requiresApproval) {
        this.logger.warn(`Tool '${toolMetadata.name}' requires human approval. Creating approval request...`);
        const approvalId = await this.approvalService.createRequest(
          context.runId,
          toolMetadata.name,
          args
        );
        // This call BLOCKS (polling DB) until a human approves or rejects — or it times out.
        // The run is effectively paused at this point. It survives server restarts.
        await this.approvalService.waitForDecision(approvalId);
        this.logger.log(`Tool '${toolMetadata.name}' approved — continuing execution.`);
      }

      // 3. Get adapter via Manager
      if (!toolMetadata.serverId) {
        throw new Error(`Tool '${namespacedToolName}' is missing serverId routing information.`);
      }

      const adapter = this.mcpManager.getAdapter(toolMetadata.serverId);
      if (!adapter) {
        throw new Error(`MCP Adapter for server '${toolMetadata.serverId}' is not available.`);
      }

      // 4. Resolve Connection
      const connectionContext: ConnectionContext = {
        workspaceId: context.workspaceId || 'default',
        serverId: toolMetadata.serverId,
      };
      const resolvedConnection = await this.connectionFactory.resolveConnection(connectionContext);

      // 5. Execute
      const result = await adapter.executeTool(toolMetadata, args, resolvedConnection);

      const duration = Date.now() - startTime;
      this.eventBus.emitToolExecutionCompleted(context.traceId, context.agentId, namespacedToolName, duration, result);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed to execute tool '${namespacedToolName}'`, error);
      this.eventBus.emitToolExecutionFailed(context.traceId, context.agentId, namespacedToolName, duration, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
        serverId: currentServerId,
        toolName: namespacedToolName,
        metadata: {}
      };
    }
  }
}
