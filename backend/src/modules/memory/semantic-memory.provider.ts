import { Injectable, Logger } from '@nestjs/common';
import { IMemoryProvider, MemoryEntry, MemoryQuery } from './memory.types';

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

  async recall(query: MemoryQuery): Promise<MemoryEntry[]> {
    this.logger.debug(`[SemanticMemory] Recall called — not yet implemented. Returning empty.`);
    // TODO: Implement vector similarity search (pgvector, Pinecone, etc.)
    return [];
  }

  async remember(entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry> {
    this.logger.debug(`[SemanticMemory] Remember called — not yet implemented. Skipping.`);
    // TODO: Embed and store in vector DB
    return {
      ...entry,
      id: 'semantic-noop',
      createdAt: new Date(),
    };
  }

  async forget(entryId: string): Promise<void> {
    this.logger.debug(`[SemanticMemory] Forget called for '${entryId}' — not yet implemented.`);
    // TODO: Remove from vector DB
  }
}
