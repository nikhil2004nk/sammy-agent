import { Module } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service';
import { ResolverModule } from '../resolver/resolver.module';
import { McpModule } from '../mcp/mcp.module';
import { EventsModule } from '../events/events.module';
import { ConnectionsModule } from '../connections/connections.module';

@Module({
  imports: [
    ResolverModule,
    McpModule,
    EventsModule,
    ConnectionsModule
  ],
  providers: [ToolExecutorService],
  exports: [ToolExecutorService]
})
export class ToolsModule {}
