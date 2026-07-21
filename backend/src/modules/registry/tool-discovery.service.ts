import { Injectable, Logger } from '@nestjs/common';
import { ToolCatalogService } from './tool-catalog.service';
import { ResourceRegistryService } from './resource-registry.service';
import { PromptRegistryService } from './prompt-registry.service';
import { ToolMetadata, McpResource, McpPrompt } from '../mcp/types/mcp.types';
import { ExecutionContext } from '../../common/execution-context';
import { PermissionService } from '../permissions/permission.service';

@Injectable()
export class ToolDiscoveryService {
  private readonly logger = new Logger(ToolDiscoveryService.name);

  constructor(
    private readonly toolCatalog: ToolCatalogService,
    private readonly resourceRegistry: ResourceRegistryService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly permissionService: PermissionService
  ) {}

  /**
   * Resolves a tool by checking its existence and enforcing permissions.
   */
  async resolveTool(context: ExecutionContext, namespacedName: string): Promise<ToolMetadata | null> {
    const tool = this.toolCatalog.getTool(namespacedName);
    if (!tool) {
      this.logger.debug(`Tool '${namespacedName}' not found.`);
      return null;
    }

    if (tool.enabled === false) {
      this.logger.debug(`Tool '${namespacedName}' is disabled.`);
      return null;
    }

    const isAuthorized = await this.permissionService.checkToolPermission(context, tool);
    if (!isAuthorized) {
      this.logger.debug(`Agent '${context.agentId}' is not authorized for tool '${namespacedName}'.`);
      return null;
    }

    return tool;
  }

  /**
   * Returns a filtered list of all tools available to the context.
   */
  async getAvailableTools(context: ExecutionContext): Promise<ToolMetadata[]> {
    const allTools = this.toolCatalog.getAllTools();
    const availableTools: ToolMetadata[] = [];
    
    for (const tool of allTools) {
      if (tool.enabled !== false && await this.permissionService.checkToolPermission(context, tool)) {
        availableTools.push(tool);
      }
    }
    
    // Sort by priority (higher priority first)
    return availableTools.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  resolveResource(uri: string): McpResource | null {
    const resource = this.resourceRegistry.getResource(uri);
    return resource || null;
  }

  resolvePrompt(name: string): McpPrompt | null {
    const prompt = this.promptRegistry.getPrompt(name);
    return prompt || null;
  }
}
