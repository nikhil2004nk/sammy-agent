import { Module } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service';
import { RegistryModule } from '../registry/registry.module';
import { McpModule } from '../mcp/mcp.module';
import { EventsModule } from '../events/events.module';
import { ConnectionsModule } from '../connections/connections.module';
import { ApprovalMiddleware } from './middleware/approval.middleware';

@Module({
  imports: [
    RegistryModule,
    McpModule,
    EventsModule,
    ConnectionsModule
  ],
  providers: [ToolExecutorService, ApprovalMiddleware],
  exports: [ToolExecutorService, ApprovalMiddleware]
})
export class ToolsModule {}
