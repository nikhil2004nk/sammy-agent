import { Module } from '@nestjs/common';
import { ToolCatalogService } from './tool-catalog.service';
import { ToolDiscoveryService } from './tool-discovery.service';
import { ResourceRegistryService } from './resource-registry.service';
import { PromptRegistryService } from './prompt-registry.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [
    ToolCatalogService,
    ToolDiscoveryService,
    ResourceRegistryService,
    PromptRegistryService,
  ],
  exports: [
    ToolCatalogService,
    ToolDiscoveryService,
    ResourceRegistryService,
    PromptRegistryService,
  ],
})
export class RegistryModule {}
