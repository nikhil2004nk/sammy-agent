export interface IEmbeddingProvider {
  /**
   * Generates a vector embedding for the given input text.
   * The dimensionality of the returned vector depends on the specific model
   * (e.g., OpenAI text-embedding-3-small is usually 1536).
   */
  embed(text: string): Promise<number[]>;

  /**
   * Generates embeddings for a batch of input texts.
   */
  embedBatch(texts: string[]): Promise<number[][]>;
}

export const IEmbeddingProvider = 'IEmbeddingProvider';
