import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../common/execution-context';
import { CapabilityResolverService } from '../resolver/capability-resolver.service';
import { McpManagerService } from '../mcp/manager/mcp-manager.service';
import { EventBusService } from '../events/event-bus.service';
import { ToolExecutionResult } from '../mcp/types/mcp.types';

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor(
    private readonly resolver: CapabilityResolverService,
    private readonly mcpManager: McpManagerService,
    private readonly eventBus: EventBusService,
  ) {}

  async executeTool(context: ExecutionContext, namespacedToolName: string, args: Record<string, any>): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    this.logger.log(`Executing tool '${namespacedToolName}' for agent '${context.agentId}'`);
    this.eventBus.emitToolExecutionStarted(context.traceId, context.agentId, namespacedToolName, args);

    try {
      // 1. Resolve tool (handles registry lookup, permissions, and enabled status)
      const toolMetadata = await this.resolver.resolveTool(context, namespacedToolName);
      if (!toolMetadata) {
        throw new Error(`Tool '${namespacedToolName}' is not available or unauthorized.`);
      }

      // 2. Get adapter via Manager
      if (!toolMetadata.serverId) {
        throw new Error(`Tool '${namespacedToolName}' is missing serverId routing information.`);
      }

      const adapter = this.mcpManager.getAdapter(toolMetadata.serverId);
      if (!adapter) {
        throw new Error(`MCP Adapter for server '${toolMetadata.serverId}' is not available.`);
      }

      // 3. Execute via adapter
      const result = await adapter.executeTool(toolMetadata.name, args);

      // 4. Emit success event
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
        serverId: 'system',
        toolName: namespacedToolName,
        metadata: {}
      };
    }
  }
}
