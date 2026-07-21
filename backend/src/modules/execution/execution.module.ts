import { Module, forwardRef } from '@nestjs/common';
import { ExecutionTrackerService } from './execution-tracker.service';
import { ExecutionController } from './execution.controller';
import { IExecutionStoreToken } from './persistence/execution-store.interface';
import { PrismaExecutionStore } from './persistence/prisma-execution.store';
import { DatabaseModule } from '../database/database.module';
import { ExecutionStreamService } from './execution-stream.service';
import { ToolsModule } from '../tools/tools.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [
    DatabaseModule, 
    forwardRef(() => ToolsModule),
    forwardRef(() => ConversationModule)
  ],
  controllers: [ExecutionController],
  providers: [
    ExecutionTrackerService,
    {
      provide: IExecutionStoreToken,
      useClass: PrismaExecutionStore
    },
    ExecutionStreamService
  ],
  exports: [ExecutionTrackerService, ExecutionStreamService]
})
export class ExecutionModule {}
