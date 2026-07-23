import { Injectable, Logger, Inject } from '@nestjs/common';
import { IMemoryProvider, MemoryEntry, MemoryQuery } from '../interfaces/memory.types';
import { IEmbeddingProvider } from '../interfaces/embedding.types';
import { IVectorStore } from '../interfaces/vector-store.interface';

/**
 * SemanticMemoryProvider — Scaffold
 *
 * This is a placeholder for vector-based semantic search.
 * In a future milestone, this will be backed by pgvector or an external
 * vector DB (Pinecone, Weaviate, etc.) and provide semantic similarity search.
 *
 * For now, it returns an empty array so the rest of the memory pipeline
 * can be built without a vector DB dependency.
 */
@Injectable()
export class SemanticMemoryProvider implements IMemoryProvider {
  private readonly logger = new Logger(SemanticMemoryProvider.name);

  constructor(
    @Inject(IEmbeddingProvider) private readonly embeddingProvider: IEmbeddingProvider,
    @Inject(IVectorStore) private readonly vectorStore: IVectorStore,
  ) {}

  async recall(query: MemoryQuery): Promise<MemoryEntry[]> {
    this.logger.debug(`Recalling semantic memory for workspace ${query.workspaceId}`);
    
    if (query.query) {
      // 1. Generate embedding for query
      const queryEmbedding = await this.embeddingProvider.embed(query.query);
      
      // 2. Search Vector Store
      const results = await this.vectorStore.search(queryEmbedding, query.limit || 5);
      
      this.logger.debug(`Found ${results.length} semantic matches`);
    }

    return [];
  }

  async remember(entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry> {
    this.logger.debug(`Remembering semantic memory: ${entry.summary}`);
    
    // 1. Generate embedding
    const embedding = await this.embeddingProvider.embed(entry.summary);
    
    // 2. Upsert to Vector Store
    const id = `semantic-${Date.now()}`;
    await this.vectorStore.upsert(id, embedding, entry);

    return {
      id,
      ...entry,
      createdAt: new Date(),
    };
  }

  async forget(entryId: string): Promise<void> {
    this.logger.debug(`[SemanticMemory] Forget called for '${entryId}' — not yet implemented.`);
    // TODO: Remove from vector DB
  }
}
