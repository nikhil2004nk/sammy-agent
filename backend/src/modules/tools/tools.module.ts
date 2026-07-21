import { Module } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service';
import { RegistryModule } from '../registry/registry.module';
import { McpModule } from '../mcp/mcp.module';
import { EventsModule } from '../events/events.module';
import { ConnectionsModule } from '../connections/connections.module';
import { ApprovalService } from './approval/approval.service';
import { PrismaModule } from '../prisma/prisma.module';

import { ApprovalController } from './approval/approval.controller';

@Module({
  imports: [
    RegistryModule,
    McpModule,
    EventsModule,
    ConnectionsModule,
    PrismaModule,
  ],
  controllers: [ApprovalController],
  providers: [ToolExecutorService, ApprovalService],
  exports: [ToolExecutorService, ApprovalService],
})
export class ToolsModule {}
