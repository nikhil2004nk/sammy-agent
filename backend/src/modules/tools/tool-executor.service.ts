import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../common/execution-context';
import { CapabilityResolverService } from '../resolver/capability-resolver.service';
import { McpManagerService } from '../mcp/manager/mcp-manager.service';
import { EventBusService } from '../events/event-bus.service';
import { ToolExecutionResult } from '../mcp/types/mcp.types';
import { ConnectionFactory } from '../connections/factories/connection.factory';
import { ConnectionContext } from '../connections/types/connection.types';

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor(
    private readonly resolver: CapabilityResolverService,
    private readonly mcpManager: McpManagerService,
    private readonly eventBus: EventBusService,
    private readonly connectionFactory: ConnectionFactory,
  ) {}

  async executeTool(context: ExecutionContext, namespacedToolName: string, args: Record<string, any>): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    this.logger.log(`Executing tool '${namespacedToolName}' for agent '${context.agentId}'`);
    this.eventBus.emitToolExecutionStarted(context.traceId, context.agentId, namespacedToolName, args);

    let currentServerId = 'system';
    try {
      // 1. Resolve tool (handles registry lookup, permissions, and enabled status)
      const toolMetadata = await this.resolver.resolveTool(context, namespacedToolName);
      if (!toolMetadata) {
        throw new Error(`Tool '${namespacedToolName}' is not available or unauthorized.`);
      }

      currentServerId = toolMetadata.serverId || 'system';

      // 2. Get adapter via Manager
      if (!toolMetadata.serverId) {
        throw new Error(`Tool '${namespacedToolName}' is missing serverId routing information.`);
      }

      const adapter = this.mcpManager.getAdapter(toolMetadata.serverId);
      if (!adapter) {
        throw new Error(`MCP Adapter for server '${toolMetadata.serverId}' is not available.`);
      }

      // 3. Resolve Connection Context
      const connectionContext: ConnectionContext = {
        workspaceId: context.workspaceId || 'default',
        
        serverId: toolMetadata.serverId,
      };
      const resolvedConnection = await this.connectionFactory.resolveConnection(connectionContext);

      // 4. Execute via adapter (pass resolvedConnection to allow adapter to use headers/auth if supported)
      // Note: for stdio, the connection is already active, but we can pass it anyway for future-proofing
      const result = await adapter.executeTool(toolMetadata.name, args, resolvedConnection);

      // 5. Emit success event
      const duration = Date.now() - startTime;
      this.eventBus.emitToolExecutionCompleted(context.traceId, context.agentId, namespacedToolName, duration, result);
      
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed to execute tool '${namespacedToolName}'`, error);
      this.eventBus.emitToolExecutionFailed(context.traceId, context.agentId, namespacedToolName, duration, error);
      
      // We return the error wrapped in a ToolExecutionResult rather than throwing, 
      // so the LLM runtime can process the error string and try again if needed.
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
