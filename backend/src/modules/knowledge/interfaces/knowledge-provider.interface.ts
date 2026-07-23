export interface KnowledgeSearchResult {
  id: string;
  source: string; // e.g., URL, filepath, PDF title
  content: string;
  score: number;
}

/**
 * Knowledge Provider
 * 
 * Unlike Memory (which is agent-centric state, runs, and facts),
 * Knowledge is workspace-centric reference material (uploaded PDFs, scraped URLs).
 */
export interface IKnowledgeProvider {
  /**
   * Search through the ingested knowledge base using vector similarity or BM25.
   */
  search(workspaceId: string, query: string, limit?: number): Promise<KnowledgeSearchResult[]>;
  
  /**
   * Ingest a new document into the knowledge base.
   */
  ingest(workspaceId: string, content: string, source: string): Promise<void>;
}

export const IKnowledgeProvider = 'IKnowledgeProvider';
