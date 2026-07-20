import { Module } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';
import { ResourceRegistryService } from './resource-registry.service';
import { PromptRegistryService } from './prompt-registry.service';

@Module({
  providers: [
    ToolRegistryService,
    ResourceRegistryService,
    PromptRegistryService,
  ],
  exports: [
    ToolRegistryService,
    ResourceRegistryService,
    PromptRegistryService,
  ],
})
export class RegistryModule {}
