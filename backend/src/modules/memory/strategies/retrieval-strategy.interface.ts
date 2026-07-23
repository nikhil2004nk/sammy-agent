import { MemoryQuery } from '../interfaces/memory.types';
import { MemoryRecord } from '../models/memory-record.model';

export interface IRetrievalStrategy {
  /**
   * The name of the strategy (e.g., FAST, PLANNING, DEEP)
   */
  name: string;
  
  /**
   * Execute the strategy against a set of memory providers.
   * Returns a merged, deduplicated, and ranked list of memory records.
   */
  execute(query: MemoryQuery, providers: any[]): Promise<MemoryRecord[]>;
}
