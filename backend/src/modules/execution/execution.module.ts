import { Module } from '@nestjs/common';
import { ExecutionTrackerService } from './execution-tracker.service';
import { ExecutionController } from './execution.controller';
import { IExecutionStoreToken } from './persistence/execution-store.interface';
import { InMemoryExecutionStore } from './persistence/in-memory-execution.store';
import { PrismaExecutionStore } from './persistence/prisma-execution.store';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ExecutionController],
  providers: [
    ExecutionTrackerService,
    {
      provide: IExecutionStoreToken,
      useClass: PrismaExecutionStore
    }
  ],
  exports: [ExecutionTrackerService]
})
export class ExecutionModule {}
