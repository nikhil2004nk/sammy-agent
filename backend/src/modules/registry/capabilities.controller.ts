import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ToolCatalogService } from './tool-catalog.service';
import { McpRegistryService } from '../mcp/registry/mcp-registry.service';

@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId')
export class CapabilitiesController {
  constructor(
    private readonly toolCatalogService: ToolCatalogService,
    private readonly mcpRegistryService: McpRegistryService
  ) {}

  @Get('tools')
  async getWorkspaceTools(@Param('workspaceId') workspaceId: string) {
    const servers = await this.mcpRegistryService.getServersForWorkspace(workspaceId);
    const serverIds = servers.map(s => s.id);
    
    // Also include 'system' tools or any tools that belong to globally available servers
    const tools = this.toolCatalogService.getAllTools().filter(t => 
      !t.serverId || t.serverId === 'system' || serverIds.includes(t.serverId)
    );
    
    return tools;
  }
}
