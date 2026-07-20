import { Module } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service';
import { ResolverModule } from '../resolver/resolver.module';
import { McpModule } from '../mcp/mcp.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [ResolverModule, McpModule, EventsModule],
  providers: [ToolExecutorService],
  exports: [ToolExecutorService],
})
export class ToolsModule {}
