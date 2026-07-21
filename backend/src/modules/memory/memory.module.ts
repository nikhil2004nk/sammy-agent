import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { PostgresEpisodicMemoryProvider } from './postgres-episodic-memory.provider';
import { SemanticMemoryProvider } from './semantic-memory.provider';
import { IEpisodicMemoryProvider, ISemanticMemoryProvider } from './memory.types';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: IEpisodicMemoryProvider,
      useClass: PostgresEpisodicMemoryProvider,
    },
    {
      provide: ISemanticMemoryProvider,
      useClass: SemanticMemoryProvider,
    },
    MemoryService,
  ],
  exports: [MemoryService],
})
export class MemoryModule {}
