export interface VectorSearchResult<T = any> {
  id: string;
  score: number; // Similarity score (e.g., cosine similarity)
  metadata: T;
}

export interface IVectorStore {
  /**
   * Upserts a vector into the database along with its associated metadata.
   */
  upsert(id: string, vector: number[], metadata: any): Promise<void>;

  /**
   * Searches the vector database for the topK most similar vectors.
   */
  search(queryVector: number[], topK: number, filter?: any): Promise<VectorSearchResult[]>;
  
  /**
   * Deletes a vector by ID.
   */
  delete(id: string): Promise<void>;
}

export const IVectorStore = 'IVectorStore';
