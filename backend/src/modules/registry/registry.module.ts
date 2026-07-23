import { Module } from '@nestjs/common';
import { ToolCatalogService } from './tool-catalog.service';
import { ToolDiscoveryService } from './tool-discovery.service';
import { ResourceRegistryService } from './resource-registry.service';
import { PromptRegistryService } from './prompt-registry.service';
import { AgentRegistryService } from './agent-registry.service';
import { PermissionsModule } from '../permissions/permissions.module';

import { McpModule } from '../mcp/mcp.module';
import { CapabilitiesController } from './capabilities.controller';

@Module({
  imports: [PermissionsModule, McpModule],
  controllers: [CapabilitiesController],
  providers: [
    ToolCatalogService,
    ToolDiscoveryService,
    ResourceRegistryService,
    PromptRegistryService,
    AgentRegistryService,
  ],
  exports: [
    ToolCatalogService,
    ToolDiscoveryService,
    ResourceRegistryService,
    PromptRegistryService,
    AgentRegistryService,
  ],
})
export class RegistryModule {}
