// -------------------------------------------------------
// Memory Types — defines interfaces for all memory tiers
// -------------------------------------------------------

export interface MemoryQuery {
  workspaceId: string;
  userId?: string;
  agentId?: string;
  limit?: number;
  query?: string; // For semantic search
}

export interface MemoryEntry {
  id: string;
  workspaceId: string;
  userId?: string;
  agentId?: string;
  runId?: string;
  summary: string;
  importance: number;
  createdAt: Date;
}

export interface IMemoryProvider {
  /**
   * Retrieve relevant memory entries for a given query context.
   */
  recall(query: MemoryQuery): Promise<MemoryEntry[]>;

  /**
   * Store a new memory entry.
   */
  remember(entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry>;

  /**
   * Remove a memory entry by ID.
   */
  forget(entryId: string): Promise<void>;
}

export const IEpisodicMemoryProvider = 'IEpisodicMemoryProvider';
export const ISemanticMemoryProvider = 'ISemanticMemoryProvider';
