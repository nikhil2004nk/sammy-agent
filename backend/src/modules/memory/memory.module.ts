import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { MemoryManager } from './memory-manager.service';
import { PostgresEpisodicMemoryProvider } from './providers/postgres-episodic-memory.provider';
import { SemanticMemoryProvider } from './providers/semantic-memory.provider';
import { OpenAIEmbeddingProvider } from './providers/openai-embedding.provider';
import { PgVectorStore } from './providers/pg-vector-store.provider';
import { IEpisodicMemoryProvider, ISemanticMemoryProvider } from './interfaces/memory.types';
import { IEmbeddingProvider } from './interfaces/embedding.types';
import { IVectorStore } from './interfaces/vector-store.interface';
import { RetrievalPipeline } from './pipelines/retrieval.pipeline';
import { WritePipeline } from './pipelines/write.pipeline';
import { RetentionPolicy } from './policies/retention.policy';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [
    {
      provide: IEpisodicMemoryProvider,
      useClass: PostgresEpisodicMemoryProvider,
    },
    {
      provide: ISemanticMemoryProvider,
      useClass: SemanticMemoryProvider,
    },
    {
      provide: IEmbeddingProvider,
      useClass: OpenAIEmbeddingProvider,
    },
    {
      provide: IVectorStore,
      useClass: PgVectorStore,
    },
    RetrievalPipeline,
    WritePipeline,
    RetentionPolicy,
    MemoryManager,
    MemoryService,
  ],
  exports: [MemoryService],
})
export class MemoryModule {}
