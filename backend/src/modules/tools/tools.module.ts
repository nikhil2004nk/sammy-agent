import { Module } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { RegistryModule } from '../registry/registry.module';
import { McpModule } from '../mcp/mcp.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PermissionsModule, RegistryModule, McpModule, EventsModule],
  providers: [ToolExecutorService],
  exports: [ToolExecutorService],
})
export class ToolsModule {}
