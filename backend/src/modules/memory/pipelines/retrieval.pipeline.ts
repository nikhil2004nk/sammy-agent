import { Injectable, Logger } from '@nestjs/common';
import { MemoryQuery, MemoryEntry } from '../interfaces/memory.types';

@Injectable()
export class RetrievalPipeline {
  private readonly logger = new Logger(RetrievalPipeline.name);

  /**
   * Pipeline: Merge -> Deduplicate -> Rank -> Budget -> Return
   */
  async execute(query: MemoryQuery, rawResults: MemoryEntry[][]): Promise<MemoryEntry[]> {
    this.logger.debug('Executing Retrieval Pipeline...');

    // 1. Merge
    const merged: MemoryEntry[] = [];
    for (const resultSet of rawResults) {
      merged.push(...resultSet);
    }
    
    // 2. Deduplicate
    // Basic deduplication by ID, though in semantic search deduplication is harder (vector similarity)
    const uniqueMap = new Map<string, MemoryEntry>();
    for (const entry of merged) {
      if (!uniqueMap.has(entry.id)) {
        uniqueMap.set(entry.id, entry);
      } else {
        // If it exists, keep the one with higher importance
        const existing = uniqueMap.get(entry.id)!;
        if (entry.importance > existing.importance) {
          uniqueMap.set(entry.id, entry);
        }
      }
    }
    let deduped = Array.from(uniqueMap.values());
    
    // 3. Rank
    // Rank by importance descending, then by recency descending
    deduped.sort((a, b) => {
      if (b.importance !== a.importance) {
        return b.importance - a.importance;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // 4. Budget
    // Apply budget constraint if specified, otherwise fallback to query limit or default
    const budget = query.budget ?? query.limit ?? 10;
    const finalResult = deduped.slice(0, budget);

    this.logger.debug(`Retrieval Pipeline complete. Merged: ${merged.length}, Deduped: ${deduped.length}, Final (Budget): ${finalResult.length}`);
    return finalResult;
  }
}
